import React, { useState, useEffect } from 'react';
import { 
  ShoppingBag, Search, Plus, Minus, Trash2, CheckCircle2, 
  Sparkles, Wine, GlassWater, Flame, Layers, LayoutGrid, Check, ArrowRight, User, RefreshCw, X
} from 'lucide-react';
import { apiService } from '../services/api';
import { useAuth } from '../context/AuthContext';

export function MeseroView() {
  const { profile, negocio, formatCurrency } = useAuth();
  const [productos, setProductos] = useState([]);
  const [mesas, setMesas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [categoriaSel, setCategoriaSel] = useState('todos');
  const [busqueda, setBusqueda] = useState('');
  
  // Identificador de Mesero
  const [meseroNombre, setMeseroNombre] = useState(profile?.nombre || 'Mesero');
  
  // Estado de Mesa Seleccionada
  const [selectedMesa, setSelectedMesa] = useState(1);
  const [mesaActualObj, setMesaActualObj] = useState(null);
  
  // Modal de Selección de Tamaño
  const [selectedProductForSize, setSelectedProductForSize] = useState(null);
  const [sizeChosen, setSizeChosen] = useState('12oz');
  
  // Estado del Carrito de Comanda
  const [cart, setCart] = useState([]);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [notas, setNotas] = useState('');
  
  // Estado del Envío
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [activeOrder, setActiveOrder] = useState(null);

  // Cargar Productos y Mesas por Tenant
  const loadData = async () => {
    try {
      setLoading(true);
      const tenantId = negocio?.id;
      const [prodsData, mesasData] = await Promise.all([
        apiService.getProductos(tenantId),
        apiService.getMesas(tenantId)
      ]);
      setProductos(prodsData);
      setMesas(mesasData);

      const foundMesa = mesasData.find(m => m.numero_mesa === parseInt(selectedMesa));
      setMesaActualObj(foundMesa || null);
    } catch (err) {
      console.error('Error al cargar datos en vista mesero:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (profile?.nombre) {
      setMeseroNombre(profile.nombre);
    }
  }, [profile]);

  useEffect(() => {
    loadData();
  }, [negocio]);

  const handleSelectMesa = (num) => {
    setSelectedMesa(num);
    const found = mesas.find(m => m.numero_mesa === parseInt(num));
    setMesaActualObj(found || null);
  };

  const handleOpenSizeModal = (producto) => {
    setSelectedProductForSize(producto);
    setSizeChosen('12oz');
  };

  const handleConfirmAddToCart = () => {
    if (!selectedProductForSize) return;

    const prod = selectedProductForSize;
    let precioUnitario = prod.precio_12oz;
    if (sizeChosen === '8oz') precioUnitario = prod.precio_8oz;
    if (sizeChosen === '24oz') precioUnitario = prod.precio_24oz;
    if (sizeChosen === '100oz') precioUnitario = prod.precio_100oz;

    setCart(prev => {
      const existingIndex = prev.findIndex(
        item => item.producto.id === prod.id && item.tamano === sizeChosen
      );

      if (existingIndex !== -1) {
        const updated = [...prev];
        updated[existingIndex].cantidad += 1;
        return updated;
      }

      return [
        ...prev,
        {
          producto: prod,
          tamano: sizeChosen,
          cantidad: 1,
          precio_unitario: precioUnitario
        }
      ];
    });

    setSelectedProductForSize(null);
  };

  const updateQuantity = (productoId, tamano, delta) => {
    setCart(prev =>
      prev
        .map(item => {
          if (item.producto.id === productoId && item.tamano === tamano) {
            const newQty = item.cantidad + delta;
            return newQty > 0 ? { ...item, cantidad: newQty } : null;
          }
          return item;
        })
        .filter(Boolean)
    );
  };

  const removeFromCart = (productoId, tamano) => {
    setCart(prev => prev.filter(item => !(item.producto.id === productoId && item.tamano === tamano)));
  };

  const cartTotal = cart.reduce((sum, item) => sum + (item.precio_unitario * item.cantidad), 0);
  const cartItemCount = cart.reduce((sum, item) => sum + item.cantidad, 0);

  // Enviar Comanda a Cocina / Caja
  const handleSendOrder = async () => {
    if (cart.length === 0) return;
    try {
      setIsSubmitting(true);
      const mesaObj = mesaActualObj || { id: `mesa-uuid-${selectedMesa}` };

      let resultOrder;
      if (mesaActualObj?.pedidoActivo) {
        resultOrder = await apiService.adicionarAPedidoExistente({
          pedidoId: mesaActualObj.pedidoActivo.id,
          items: cart,
          montoAdicional: cartTotal,
          notas,
          negocioId: negocio?.id
        });
      } else {
        resultOrder = await apiService.crearPedido({
          negocio_id: negocio?.id,
          mesa_id: mesaObj.id,
          selectedMesaNum: selectedMesa,
          items: cart,
          total: cartTotal,
          notas,
          meseroNombre
        });
      }

      setActiveOrder({
        ...resultOrder,
        numero_mesa: selectedMesa,
        items: [...cart]
      });

      setCart([]);
      setNotas('');
      setIsCartOpen(false);
      loadData();
    } catch (err) {
      console.error('Error al enviar comanda:', err);
      alert('Hubo un inconveniente al enviar la comanda. Intenta nuevamente.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const productosFiltrados = productos.filter(p => {
    const matchCat = categoriaSel === 'todos' || p.categoria === categoriaSel;
    const matchSearch = 
      p.nombre.toLowerCase().includes(busqueda.toLowerCase()) ||
      (p.ingredientes && p.ingredientes.toLowerCase().includes(busqueda.toLowerCase()));
    return matchCat && matchSearch;
  });

  const categorias = [
    { id: 'todos', label: 'Todos', icon: LayoutGrid },
    { id: 'con_licor', label: 'Con Licor', icon: Flame },
    { id: 'sin_licor', label: 'Sin Licor', icon: GlassWater },
    { id: 'cremoso', label: 'Cremosos', icon: Layers }
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 pb-28">
      
      {/* HEADER MÓDULO DE MESEROS */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6 bg-slate-900 border border-slate-800 p-5 sm:p-6 rounded-2xl">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-emerald-500 text-slate-950 flex items-center justify-center font-black text-xl shrink-0 shadow-sm">
            🧑‍🍳
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl sm:text-2xl font-extrabold text-white">Toma de Pedidos</h1>
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            </div>
            <p className="text-xs text-slate-400 mt-0.5">
              {negocio?.nombre || 'GST Resto Bar'} &bull; Comandas en vivo para Cocina y Caja
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 bg-slate-950 px-3 py-2 rounded-xl border border-slate-800 text-xs">
            <User className="w-4 h-4 text-emerald-400" />
            <input
              type="text"
              value={meseroNombre}
              onChange={(e) => setMeseroNombre(e.target.value)}
              className="bg-transparent text-white font-bold outline-none w-32 text-xs"
              placeholder="Nombre Mesero"
            />
          </div>

          <button
            onClick={loadData}
            className="p-2.5 rounded-xl bg-slate-800 text-slate-300 hover:text-white border border-slate-700 transition-colors"
            title="Recargar mesas y menú"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </div>

      {/* SELECTOR DESLIZABLE DE MESAS (1 a 10) */}
      <div className="mb-6">
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-xs font-black text-slate-400 uppercase tracking-wider">
            1. Selecciona la Mesa para la Comanda
          </h2>
          {mesaActualObj && (
            <span className={`text-[11px] font-bold px-2.5 py-0.5 rounded-full border ${
              mesaActualObj.estado === 'ocupada' 
                ? 'bg-rose-500/10 text-rose-400 border-rose-500/20' 
                : 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
            }`}>
              Mesa #{selectedMesa}: {mesaActualObj.estado === 'ocupada' ? 'Ocupada (Adicionar)' : 'Disponible (Nueva)'}
            </span>
          )}
        </div>

        <div className="grid grid-cols-5 sm:grid-cols-10 gap-2">
          {Array.from({ length: 10 }, (_, i) => i + 1).map(num => {
            const isSelected = parseInt(selectedMesa) === num;
            const mesaObj = mesas.find(m => m.numero_mesa === num);
            const isOcupada = mesaObj?.estado === 'ocupada';

            return (
              <button
                key={num}
                onClick={() => handleSelectMesa(num)}
                className={`py-3 rounded-xl font-black text-sm transition-all flex flex-col items-center justify-center border relative ${
                  isSelected
                    ? 'bg-emerald-500 text-slate-950 border-emerald-400 shadow-md shadow-emerald-500/20 scale-[1.02]'
                    : isOcupada
                    ? 'bg-rose-950/40 text-rose-300 border-rose-900/60 hover:bg-rose-900/40'
                    : 'bg-slate-900 text-slate-300 border-slate-800 hover:bg-slate-800 hover:text-white'
                }`}
              >
                <span>Mesa {num}</span>
                {isOcupada && !isSelected && (
                  <span className="w-1.5 h-1.5 rounded-full bg-rose-500 absolute top-1.5 right-1.5" />
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* CONTENIDO PRINCIPAL: CATÁLOGO DE PRODUCTOS + RESUMEN DESK */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
        
        {/* COLUMNA CATÁLOGO (2 COLS EN LG) */}
        <div className="lg:col-span-2 space-y-5">
          
          {/* BUSCADOR Y SELECCIÓN DESLIZABLE DE CATEGORÍAS EN MÓVIL */}
          <div className="space-y-3">
            <div className="relative">
              <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                placeholder="Buscar bebida por nombre o ingrediente..."
                value={busqueda}
                onChange={(e) => setBusqueda(e.target.value)}
                className="w-full bg-slate-900 border border-slate-800 rounded-xl pl-10 pr-4 py-2.5 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500/50"
              />
            </div>

            {/* CATEGORÍAS DESLIZABLES HORIZONTALMENTE (NO SCROLLBAR) */}
            <div className="flex items-center gap-2 overflow-x-auto pb-1 no-scrollbar scroll-smooth">
              {categorias.map(cat => {
                const Icon = cat.icon;
                const active = categoriaSel === cat.id;
                return (
                  <button
                    key={cat.id}
                    onClick={() => setCategoriaSel(cat.id)}
                    className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all border shrink-0 ${
                      active
                        ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30'
                        : 'bg-slate-900 text-slate-400 border-slate-800 hover:text-slate-200'
                    }`}
                  >
                    <Icon className="w-3.5 h-3.5" />
                    <span>{cat.label}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* GRID DE PRODUCTOS */}
          {loading ? (
            <div className="py-16 text-center text-slate-500">
              <RefreshCw className="w-6 h-6 animate-spin mx-auto mb-2 text-emerald-400" />
              <p className="text-xs">Cargando productos...</p>
            </div>
          ) : productosFiltrados.length === 0 ? (
            <div className="py-12 bg-slate-900/50 border border-slate-800 rounded-2xl text-center text-slate-400 text-xs">
              No se encontraron productos en esta categoría.
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {productosFiltrados.map(prod => (
                <div
                  key={prod.id}
                  className="bg-slate-900 border border-slate-800 hover:border-slate-700 p-4 rounded-2xl flex flex-col justify-between transition-all group"
                >
                  <div className="flex gap-3.5 mb-3">
                    <img
                      src={prod.imagen_url || 'https://images.unsplash.com/photo-1536935338788-846bb9981813?auto=format&fit=crop&w=400&q=80'}
                      alt={prod.nombre}
                      className="w-16 h-16 rounded-xl object-cover shrink-0 border border-slate-800"
                    />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-1">
                        <h3 className="font-extrabold text-sm text-white group-hover:text-emerald-400 transition-colors truncate">
                          {prod.nombre}
                        </h3>
                        <span className="text-[10px] uppercase font-bold text-slate-400 bg-slate-800 px-2 py-0.5 rounded">
                          {prod.categoria.replace('_', ' ')}
                        </span>
                      </div>
                      <p className="text-xs text-slate-400 mt-1 line-clamp-2">
                        {prod.ingredientes || 'Sin ingredientes especificados'}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center justify-between pt-3 border-t border-slate-800/60 mt-auto">
                    <div className="text-xs">
                      <span className="text-slate-400 block text-[10px]">Desde (12oz)</span>
                      <span className="font-black text-emerald-400 text-sm">{formatCurrency(prod.precio_12oz)}</span>
                    </div>

                    <button
                      onClick={() => handleOpenSizeModal(prod)}
                      className="px-3.5 py-1.5 rounded-xl bg-emerald-500 text-slate-950 font-bold text-xs hover:bg-emerald-400 transition-colors flex items-center gap-1.5 shadow-sm"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      <span>Agregar</span>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}

        </div>

        {/* COLUMNA DERECHA: RESUMEN DE COMANDA (DESKTOP) */}
        <div className="hidden lg:block bg-slate-900 border border-slate-800 rounded-2xl p-5 sticky top-20">
          <div className="flex items-center justify-between pb-4 border-b border-slate-800 mb-4">
            <div className="flex items-center gap-2">
              <ShoppingBag className="w-5 h-5 text-emerald-400" />
              <h2 className="font-extrabold text-base text-white">Comanda Mesa #{selectedMesa}</h2>
            </div>
            <span className="text-xs font-bold px-2 py-0.5 rounded bg-slate-800 text-slate-300">
              {cartItemCount} ítems
            </span>
          </div>

          {cart.length === 0 ? (
            <div className="py-12 text-center text-slate-500">
              <p className="text-xs">El carrito está vacío.</p>
              <p className="text-[11px] text-slate-600 mt-1">Selecciona productos para armar el pedido.</p>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="max-h-72 overflow-y-auto space-y-3 pr-1">
                {cart.map((item, idx) => (
                  <div key={idx} className="flex items-center justify-between bg-slate-950 p-3 rounded-xl border border-slate-800 text-xs">
                    <div className="flex-1 min-w-0 pr-2">
                      <p className="font-bold text-white truncate">{item.producto.nombre}</p>
                      <span className="text-[10px] font-bold text-emerald-400">{item.tamano}</span>
                      <p className="text-[11px] text-slate-400">{formatCurrency(item.precio_unitario)}</p>
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => updateQuantity(item.producto.id, item.tamano, -1)}
                        className="p-1 rounded bg-slate-800 text-slate-300 hover:text-white"
                      >
                        <Minus className="w-3 h-3" />
                      </button>
                      <span className="font-black text-white w-4 text-center">{item.cantidad}</span>
                      <button
                        onClick={() => updateQuantity(item.producto.id, item.tamano, 1)}
                        className="p-1 rounded bg-slate-800 text-slate-300 hover:text-white"
                      >
                        <Plus className="w-3 h-3" />
                      </button>
                      <button
                        onClick={() => removeFromCart(item.producto.id, item.tamano)}
                        className="p-1 rounded text-rose-400 hover:bg-rose-950/50 ml-1"
                      >
                        <Trash2 className="w-3 h-3" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-400 mb-1">Notas especiales:</label>
                <textarea
                  value={notas}
                  onChange={(e) => setNotas(e.target.value)}
                  placeholder="Ej. Sin hielo, servilletas extra..."
                  rows={2}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2 text-xs text-white placeholder-slate-600 focus:outline-none focus:border-emerald-500/50"
                />
              </div>

              <div className="pt-3 border-t border-slate-800 flex items-center justify-between">
                <span className="text-xs text-slate-400 font-medium">Total Estimado</span>
                <span className="text-lg font-black text-emerald-400">{formatCurrency(cartTotal)}</span>
              </div>

              <button
                onClick={handleSendOrder}
                disabled={isSubmitting || cart.length === 0}
                className="w-full py-3 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black text-sm transition-all disabled:opacity-50 shadow-md shadow-emerald-500/20 flex items-center justify-center gap-2"
              >
                {isSubmitting ? (
                  <RefreshCw className="w-4 h-4 animate-spin" />
                ) : (
                  <>
                    <span>Enviar a Cocina / Caja</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </div>
          )}
        </div>

      </div>

      {/* BOTÓN FLOTANTE MÓVIL (FAB) PARA VER RESUMEN DE PEDIDO */}
      <div className="fixed bottom-6 right-6 lg:hidden z-40">
        <button
          onClick={() => setIsCartOpen(true)}
          className="bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black px-5 py-3.5 rounded-full shadow-2xl flex items-center gap-3 active:scale-95 transition-all border border-emerald-400"
        >
          <ShoppingBag className="w-5 h-5" />
          <span className="text-sm">Comanda Mesa #{selectedMesa}</span>
          {cartItemCount > 0 && (
            <span className="bg-slate-950 text-emerald-400 px-2 py-0.5 rounded-full text-xs font-extrabold">
              {cartItemCount}
            </span>
          )}
        </button>
      </div>

      {/* MODAL MÓVIL DE RESUMEN DE COMANDA */}
      {isCartOpen && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-end sm:items-center justify-center p-0 sm:p-4">
          <div className="bg-slate-900 border border-slate-800 w-full sm:max-w-lg rounded-t-3xl sm:rounded-2xl p-6 space-y-4 max-h-[85vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div className="flex items-center gap-2">
                <ShoppingBag className="w-5 h-5 text-emerald-400" />
                <h3 className="font-extrabold text-base text-white">Comanda Mesa #{selectedMesa}</h3>
              </div>
              <button
                onClick={() => setIsCartOpen(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {cart.length === 0 ? (
              <div className="py-8 text-center text-slate-500 text-xs">
                No hay productos agregados en esta comanda.
              </div>
            ) : (
              <div className="space-y-3">
                {cart.map((item, idx) => (
                  <div key={idx} className="flex items-center justify-between bg-slate-950 p-3 rounded-xl border border-slate-800 text-xs">
                    <div>
                      <p className="font-bold text-white">{item.producto.nombre}</p>
                      <span className="text-[10px] font-bold text-emerald-400">{item.tamano}</span>
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => updateQuantity(item.producto.id, item.tamano, -1)}
                        className="p-1.5 rounded bg-slate-800 text-slate-300"
                      >
                        <Minus className="w-3.5 h-3.5" />
                      </button>
                      <span className="font-black text-white text-sm w-4 text-center">{item.cantidad}</span>
                      <button
                        onClick={() => updateQuantity(item.producto.id, item.tamano, 1)}
                        className="p-1.5 rounded bg-slate-800 text-slate-300"
                      >
                        <Plus className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                ))}

                <div>
                  <label className="block text-[11px] font-bold text-slate-400 mb-1">Notas especiales:</label>
                  <textarea
                    value={notas}
                    onChange={(e) => setNotas(e.target.value)}
                    placeholder="Ej. Sin hielo, servilletas extra..."
                    rows={2}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2 text-xs text-white"
                  />
                </div>

                <div className="pt-3 border-t border-slate-800 flex items-center justify-between">
                  <span className="text-xs text-slate-400">Total</span>
                  <span className="text-xl font-black text-emerald-400">{formatCurrency(cartTotal)}</span>
                </div>

                <button
                  onClick={handleSendOrder}
                  disabled={isSubmitting}
                  className="w-full py-3.5 rounded-xl bg-emerald-500 text-slate-950 font-black text-sm shadow-md"
                >
                  {isSubmitting ? 'Enviando...' : 'Confirmar y Enviar Comanda'}
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* MODAL SELECCIÓN DE TAMAÑO (8oz, 12oz, 24oz, 100oz) */}
      {selectedProductForSize && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 w-full max-w-md rounded-2xl p-6 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="font-extrabold text-base text-white truncate pr-2">
                {selectedProductForSize.nombre}
              </h3>
              <button
                onClick={() => setSelectedProductForSize(null)}
                className="text-slate-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <p className="text-xs text-slate-400">Selecciona el tamaño o presentación deseada:</p>

            <div className="grid grid-cols-2 gap-2.5">
              {[
                { size: '8oz', label: 'Vasito 8 oz', price: selectedProductForSize.precio_8oz },
                { size: '12oz', label: 'Estándar 12 oz', price: selectedProductForSize.precio_12oz },
                { size: '24oz', label: 'Grande 24 oz', price: selectedProductForSize.precio_24oz },
                { size: '100oz', label: 'Jarra 100 oz', price: selectedProductForSize.precio_100oz }
              ].map(opt => (
                <button
                  key={opt.size}
                  onClick={() => setSizeChosen(opt.size)}
                  className={`p-3 rounded-xl border text-left transition-all ${
                    sizeChosen === opt.size
                      ? 'bg-emerald-500/10 border-emerald-500 text-emerald-400 font-black'
                      : 'bg-slate-950 border-slate-800 text-slate-300 hover:bg-slate-800'
                  }`}
                >
                  <div className="text-xs font-bold">{opt.label}</div>
                  <div className="text-xs text-emerald-400 mt-1">{formatCurrency(opt.price)}</div>
                </button>
              ))}
            </div>

            <div className="pt-3 border-t border-slate-800 flex justify-end gap-2">
              <button
                onClick={() => setSelectedProductForSize(null)}
                className="px-4 py-2 rounded-xl bg-slate-800 text-slate-300 text-xs font-bold"
              >
                Cancelar
              </button>
              <button
                onClick={handleConfirmAddToCart}
                className="px-5 py-2 rounded-xl bg-emerald-500 text-slate-950 text-xs font-black"
              >
                Confirmar
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
