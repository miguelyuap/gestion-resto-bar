import React, { useState, useEffect } from 'react';
import { 
  ShoppingBag, Search, Plus, Minus, Trash2, CheckCircle2, 
  Sparkles, Wine, GlassWater, Flame, Layers, LayoutGrid, Check, ArrowRight, User, RefreshCw
} from 'lucide-react';
import { apiService } from '../services/api';

export function MeseroView() {
  const [productos, setProductos] = useState([]);
  const [mesas, setMesas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [categoriaSel, setCategoriaSel] = useState('todos');
  const [busqueda, setBusqueda] = useState('');
  
  // Mesero e Identificador
  const [meseroNombre, setMeseroNombre] = useState('Carlos (Mesero)');
  
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

  // Cargar Productos y Mesas
  const loadData = async () => {
    try {
      setLoading(true);
      const [prodsData, mesasData] = await Promise.all([
        apiService.getProductos(),
        apiService.getMesas()
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
    loadData();
  }, []);

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
          notas
        });
      } else {
        resultOrder = await apiService.crearPedido({
          mesa_id: mesaObj.id,
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

  // Filtrado de Productos
  const productosFiltrados = productos.filter(p => {
    const matchCat = categoriaSel === 'todos' || p.categoria === categoriaSel;
    const matchSearch = 
      p.nombre.toLowerCase().includes(busqueda.toLowerCase()) ||
      (p.ingredientes && p.ingredientes.toLowerCase().includes(busqueda.toLowerCase()));
    return matchCat && matchSearch;
  });

  const formatCOP = (val) => {
    return new Intl.NumberFormat('es-CO', {
      style: 'currency',
      currency: 'COP',
      maximumFractionDigits: 0
    }).format(val || 0);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 pb-28">
      
      {/* HEADER MÓDULO DE MESEROS */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6 bg-slate-900/90 border border-slate-800 p-6 rounded-3xl backdrop-blur-md">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-emerald-500 to-teal-400 text-slate-950 flex items-center justify-center font-black text-xl shadow-lg shrink-0">
            🧑‍🍳
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-2xl font-extrabold text-white">Módulo de Meseros (Toma de Pedidos)</h1>
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-ping" />
            </div>
            <p className="text-xs text-slate-400 mt-0.5">
              Ingresa comandas en las Mesas 1 a 10 y envíalas en tiempo real a la pantalla de caja/cocina.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 bg-slate-950 px-3 py-2 rounded-2xl border border-slate-800 text-xs">
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
            className="p-2.5 rounded-2xl bg-slate-800 text-slate-300 hover:text-white border border-slate-700 transition-colors"
            title="Refrescar plano"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* PLANO DE MESAS 1 A 10 */}
      <div className="mb-8 p-5 rounded-3xl bg-slate-900/60 border border-slate-800">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <LayoutGrid className="w-4 h-4 text-emerald-400" />
            <h3 className="text-xs font-extrabold text-slate-300 uppercase tracking-wider">
              Plano Táctil de Mesas (Selecciona la Mesa a Atender):
            </h3>
          </div>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-5 lg:grid-cols-10 gap-3">
          {Array.from({ length: 10 }, (_, i) => i + 1).map(num => {
            const isSelected = selectedMesa === num;
            const mesaObj = mesas.find(m => m.numero_mesa === num);
            const isOcupada = mesaObj?.estado === 'ocupada';

            return (
              <button
                key={num}
                onClick={() => handleSelectMesa(num)}
                className={`p-3 rounded-2xl border text-center transition-all flex flex-col items-center justify-between relative overflow-hidden ${
                  isSelected
                    ? 'bg-gradient-to-b from-emerald-500/20 to-teal-500/20 border-emerald-400 shadow-lg glow-emerald scale-105'
                    : isOcupada
                    ? 'bg-amber-500/10 border-amber-500/40 text-amber-300 hover:border-amber-400'
                    : 'bg-slate-950 border-slate-800 text-slate-300 hover:border-slate-700'
                }`}
              >
                <div className="flex items-center justify-between w-full mb-1">
                  <span className="text-[10px] font-mono text-slate-400">Mesa</span>
                  <span className={`w-2 h-2 rounded-full ${isOcupada ? 'bg-amber-400 animate-pulse' : 'bg-emerald-400'}`} />
                </div>
                <span className="text-lg font-black text-white">#{num}</span>
                <span className="text-[10px] font-bold mt-1 uppercase tracking-tight">
                  {isOcupada ? 'Con Cuenta' : 'Disponible'}
                </span>

                {isSelected && (
                  <div className="absolute top-1 right-1 bg-emerald-400 text-slate-950 rounded-full p-0.5">
                    <Check className="w-3 h-3 stroke-[3]" />
                  </div>
                )}
              </button>
            );
          })}
        </div>

        {mesaActualObj?.pedidoActivo && (
          <div className="mt-4 p-3 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-between">
            <span className="text-xs text-amber-300 font-bold">
              Mesa #{selectedMesa} con consumo activo: {formatCOP(mesaActualObj.pedidoActivo.total)}
            </span>
            <span className="text-[11px] bg-amber-500/20 text-amber-300 px-2 py-0.5 rounded-lg font-semibold border border-amber-500/30">
              ➕ Los productos elegidos se adicionarán a esta mesa
            </span>
          </div>
        )}
      </div>

      {/* ALERTA DE COMANDA ENVIADA */}
      {activeOrder && (
        <div className="mb-8 p-6 rounded-3xl bg-emerald-950/40 border border-emerald-500/40 shadow-xl glow-emerald relative overflow-hidden">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-2xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center shrink-0 border border-emerald-500/30">
                <CheckCircle2 className="w-7 h-7" />
              </div>
              <div>
                <span className="text-xs font-semibold text-emerald-400 uppercase tracking-wide">
                  ¡Comanda Enviada a Cocina/Caja!
                </span>
                <h3 className="text-lg font-bold text-white">
                  Mesa #{activeOrder.numero_mesa} &bull; Total: {formatCOP(activeOrder.total)}
                </h3>
              </div>
            </div>

            <button
              onClick={() => setActiveOrder(null)}
              className="px-4 py-2 bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-300 border border-emerald-500/40 rounded-xl text-xs font-bold"
            >
              Tomar otra comanda
            </button>
          </div>
        </div>
      )}

      {/* CATEGORÍAS Y BÚSQUEDA */}
      <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4 mb-8">
        <div className="flex items-center gap-2 overflow-x-auto pb-2 md:pb-0 scrollbar-none">
          <button
            onClick={() => setCategoriaSel('todos')}
            className={`px-4 py-2.5 rounded-2xl text-xs font-extrabold transition-all whitespace-nowrap flex items-center gap-2 ${
              categoriaSel === 'todos'
                ? 'bg-gradient-to-r from-emerald-400 to-cyan-400 text-slate-950 shadow-lg shadow-emerald-500/20'
                : 'bg-slate-900/80 text-slate-300 border border-slate-800 hover:border-slate-700'
            }`}
          >
            <Sparkles className="w-4 h-4" />
            <span>Todos los Granizados</span>
          </button>

          <button
            onClick={() => setCategoriaSel('con_licor')}
            className={`px-4 py-2.5 rounded-2xl text-xs font-extrabold transition-all whitespace-nowrap flex items-center gap-2 ${
              categoriaSel === 'con_licor'
                ? 'bg-gradient-to-r from-emerald-500 to-teal-400 text-slate-950 shadow-lg shadow-emerald-500/20'
                : 'bg-slate-900/80 text-slate-300 border border-slate-800 hover:border-slate-700'
            }`}
          >
            <Flame className="w-4 h-4 text-emerald-400" />
            <span>Con Licor 🍾</span>
          </button>

          <button
            onClick={() => setCategoriaSel('sin_licor')}
            className={`px-4 py-2.5 rounded-2xl text-xs font-extrabold transition-all whitespace-nowrap flex items-center gap-2 ${
              categoriaSel === 'sin_licor'
                ? 'bg-gradient-to-r from-cyan-400 to-blue-500 text-slate-950 shadow-lg shadow-cyan-500/20'
                : 'bg-slate-900/80 text-slate-300 border border-slate-800 hover:border-slate-700'
            }`}
          >
            <GlassWater className="w-4 h-4 text-cyan-400" />
            <span>Sin Licor 🍧</span>
          </button>

          <button
            onClick={() => setCategoriaSel('cremoso')}
            className={`px-4 py-2.5 rounded-2xl text-xs font-extrabold transition-all whitespace-nowrap flex items-center gap-2 ${
              categoriaSel === 'cremoso'
                ? 'bg-gradient-to-r from-pink-500 to-purple-500 text-white shadow-lg shadow-pink-500/20'
                : 'bg-slate-900/80 text-slate-300 border border-slate-800 hover:border-slate-700'
            }`}
          >
            <Layers className="w-4 h-4 text-pink-400" />
            <span>Cremosos 🍦</span>
          </button>
        </div>

        <div className="relative min-w-[240px]">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Buscar granizado..."
            value={busqueda}
            onChange={(e) => setBusqueda(e.target.value)}
            className="w-full bg-slate-900/90 border border-slate-800 focus:border-emerald-500 rounded-2xl pl-10 pr-4 py-2.5 text-xs text-white placeholder-slate-500 outline-none transition-all"
          />
        </div>
      </div>

      {/* GRILLA DE PRODUCTOS */}
      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="h-64 rounded-3xl bg-slate-900/50 animate-pulse border border-slate-800" />
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {productosFiltrados.map(prod => (
            <div 
              key={prod.id}
              className="group relative bg-slate-900/70 hover:bg-slate-900 border border-slate-800 hover:border-emerald-500/50 rounded-3xl overflow-hidden transition-all flex flex-col justify-between"
            >
              <div className="relative h-44 w-full overflow-hidden bg-slate-950">
                <img 
                  src={prod.imagen_url} 
                  alt={prod.nombre}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/20 to-transparent" />
                <span className="absolute top-3 left-3 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider bg-emerald-500 text-slate-950">
                  {prod.categoria}
                </span>
              </div>

              <div className="p-5 flex-1 flex flex-col justify-between">
                <div>
                  <h3 className="font-extrabold text-base text-white">{prod.nombre}</h3>
                  <p className="text-xs text-slate-400 mt-1 italic">{prod.ingredientes}</p>
                </div>

                <div className="mt-4 pt-3 border-t border-slate-800/80">
                  <button
                    onClick={() => handleOpenSizeModal(prod)}
                    className="w-full py-2.5 bg-gradient-to-r from-emerald-500 to-cyan-400 hover:from-emerald-400 hover:to-cyan-300 text-slate-950 font-extrabold rounded-2xl text-xs flex items-center justify-center gap-2 transition-all shadow-md active:scale-95"
                  >
                    <Plus className="w-4 h-4" />
                    <span>Elegir Tamaño & Adicionar</span>
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* MODAL SELECCIONAR TAMAÑO PARA COMANDA */}
      {selectedProductForSize && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md">
          <div className="w-full max-w-md bg-[#080c14] border border-emerald-500/40 rounded-3xl p-6 shadow-2xl glow-emerald">
            
            <div className="flex items-center justify-between pb-4 border-b border-slate-800">
              <div>
                <span className="text-[10px] font-black text-emerald-400 uppercase tracking-wider block">
                  Comanda Mesero (Mesa #{selectedMesa})
                </span>
                <h3 className="text-xl font-extrabold text-white">{selectedProductForSize.nombre}</h3>
              </div>
              <button 
                onClick={() => setSelectedProductForSize(null)}
                className="text-slate-400 hover:text-white p-2 rounded-xl text-xs font-bold"
              >
                ✕
              </button>
            </div>

            <div className="space-y-2.5 my-5">
              {[
                { size: '8oz', label: 'PEQUEÑO (8 oz)', price: selectedProductForSize.precio_8oz },
                { size: '12oz', label: 'MEDIANO (12 oz)', price: selectedProductForSize.precio_12oz },
                { size: '24oz', label: 'GRANDE (24 oz)', price: selectedProductForSize.precio_24oz },
                { size: '100oz', label: 'NEVERA (100 oz)', price: selectedProductForSize.precio_100oz }
              ].map(opt => (
                <button
                  key={opt.size}
                  onClick={() => setSizeChosen(opt.size)}
                  className={`w-full p-3.5 rounded-2xl border text-left flex items-center justify-between transition-all ${
                    sizeChosen === opt.size
                      ? 'bg-gradient-to-r from-emerald-500/20 to-cyan-500/20 border-emerald-400 shadow-md'
                      : 'bg-slate-900/80 border-slate-800 text-slate-400 hover:border-slate-700'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div className={`w-5 h-5 rounded-full border flex items-center justify-center ${
                      sizeChosen === opt.size ? 'border-emerald-400 bg-emerald-400' : 'border-slate-600'
                    }`}>
                      {sizeChosen === opt.size && <Check className="w-3 h-3 text-slate-950 stroke-[3]" />}
                    </div>
                    <span className="font-extrabold text-xs text-white">{opt.label}</span>
                  </div>
                  <span className="font-black text-sm text-emerald-400">{formatCOP(opt.price)}</span>
                </button>
              ))}
            </div>

            <button
              onClick={handleConfirmAddToCart}
              className="w-full py-3.5 bg-gradient-to-r from-emerald-400 via-cyan-400 to-teal-400 text-slate-950 font-black rounded-2xl text-sm flex items-center justify-center gap-2 transition-all shadow-lg active:scale-95"
            >
              <span>Agregar a la Comanda (Mesa #{selectedMesa})</span>
            </button>

          </div>
        </div>
      )}

      {/* BARRA FLOTANTE DE COMANDA */}
      {cartItemCount > 0 && (
        <div className="fixed bottom-4 left-4 right-4 max-w-xl mx-auto z-40">
          <div className="glass-panel rounded-3xl p-4 shadow-2xl border border-emerald-500/40 flex items-center justify-between gap-4 glow-emerald">
            <div className="flex items-center gap-3">
              <div className="w-11 h-11 rounded-2xl bg-emerald-400 text-slate-950 flex items-center justify-center font-black text-base shadow-lg">
                {cartItemCount}
              </div>
              <div>
                <p className="text-xs text-slate-400 font-medium">Comanda para Mesa #{selectedMesa}</p>
                <p className="text-lg font-black text-white">{formatCOP(cartTotal)}</p>
              </div>
            </div>

            <button
              onClick={() => setIsCartOpen(true)}
              className="px-5 py-3 bg-gradient-to-r from-emerald-500 via-teal-400 to-cyan-400 text-slate-950 font-black rounded-2xl text-xs sm:text-sm flex items-center gap-2 transition-all shadow-lg active:scale-95"
            >
              <span>Ver Comanda Mesero</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* DRAWER DE COMANDA */}
      {isCartOpen && (
        <div className="fixed inset-0 z-50 flex justify-end bg-slate-950/80 backdrop-blur-sm transition-opacity">
          <div className="w-full max-w-md bg-[#080c14] border-l border-slate-800 h-full flex flex-col justify-between p-6 overflow-y-auto">
            
            <div>
              <div className="flex items-center justify-between pb-4 border-b border-slate-800">
                <div className="flex items-center gap-2">
                  <ShoppingBag className="w-5 h-5 text-emerald-400" />
                  <h2 className="text-lg font-black text-white">Comanda Mesero - Mesa #{selectedMesa}</h2>
                </div>
                <button
                  onClick={() => setIsCartOpen(false)}
                  className="text-slate-400 hover:text-white p-2 rounded-xl hover:bg-slate-800 transition-colors text-xs font-bold"
                >
                  ✕ Cerrar
                </button>
              </div>

              <div className="space-y-3 my-4">
                {cart.map(({ producto, tamano, cantidad, precio_unitario }) => (
                  <div 
                    key={`${producto.id}-${tamano}`}
                    className="p-3.5 rounded-2xl bg-slate-900/80 border border-slate-800 flex items-center justify-between gap-3"
                  >
                    <div>
                      <div className="flex items-center gap-2">
                        <h4 className="text-xs font-black text-white">{producto.nombre}</h4>
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 uppercase">
                          {tamano}
                        </span>
                      </div>
                      <p className="text-xs text-emerald-400 font-bold mt-1">
                        {formatCOP(precio_unitario * cantidad)}
                      </p>
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => updateQuantity(producto.id, tamano, -1)}
                        className="w-7 h-7 rounded-lg bg-slate-800 text-white text-xs font-bold flex items-center justify-center"
                      >
                        -
                      </button>
                      <span className="text-xs font-bold text-white px-1">{cantidad}</span>
                      <button
                        onClick={() => updateQuantity(producto.id, tamano, 1)}
                        className="w-7 h-7 rounded-lg bg-emerald-400 text-slate-950 text-xs font-bold flex items-center justify-center"
                      >
                        +
                      </button>
                      <button
                        onClick={() => removeFromCart(producto.id, tamano)}
                        className="text-slate-500 hover:text-rose-400 ml-1"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>

              <div className="mt-4">
                <label className="block text-xs text-slate-400 font-semibold mb-1">
                  Observaciones para Cocina/Caja:
                </label>
                <textarea
                  value={notas}
                  onChange={(e) => setNotas(e.target.value)}
                  placeholder="Ej: Licor aparte, sin hielo extra, etc."
                  rows={2}
                  className="w-full bg-slate-900 border border-slate-800 rounded-2xl p-3 text-xs text-white placeholder-slate-500 outline-none focus:border-emerald-500"
                />
              </div>
            </div>

            <div className="pt-4 border-t border-slate-800 mt-6">
              <div className="flex items-center justify-between mb-4">
                <span className="text-sm text-slate-400 font-semibold">Total Comanda:</span>
                <span className="text-2xl font-black text-emerald-400">{formatCOP(cartTotal)}</span>
              </div>

              <button
                onClick={handleSendOrder}
                disabled={isSubmitting || cart.length === 0}
                className="w-full py-4 bg-gradient-to-r from-emerald-400 via-cyan-400 to-teal-400 text-slate-950 font-black rounded-2xl text-sm transition-all shadow-xl disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {isSubmitting ? (
                  <span>Enviando comanda a Caja/Cocina...</span>
                ) : (
                  <>
                    <CheckCircle2 className="w-5 h-5" />
                    <span>{mesaActualObj?.pedidoActivo ? 'Adicionar a Cuenta de la Mesa' : 'Enviar Comanda a Cocina/Caja'}</span>
                  </>
                )}
              </button>
            </div>

          </div>
        </div>
      )}

    </div>
  );
}
