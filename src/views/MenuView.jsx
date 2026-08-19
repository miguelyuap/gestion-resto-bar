import React, { useState, useEffect } from 'react';
import { 
  Search, Sparkles, Wine, GlassWater, Flame, Layers, 
  Check, User, LayoutGrid, CheckCircle2, ShoppingBag, Plus, Minus, Trash2, ArrowRight
} from 'lucide-react';
import { apiService } from '../services/api';

export function MenuView({ initialMesaNum }) {
  const [productos, setProductos] = useState([]);
  const [mesas, setMesas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [categoriaSel, setCategoriaSel] = useState('todos');
  const [busqueda, setBusqueda] = useState('');
  
  // Si se ingresó por QR (?mesa=X), se fuerza MODO CLIENTE (Consulta 100% Informativa)
  // Si no hay parámetro de mesa, por defecto abre en MODO MESERO (Toma de Pedidos)
  const [modoOperacion, setModoOperacion] = useState(initialMesaNum ? 'cliente' : 'mesero');
  const [meseroNombre, setMeseroNombre] = useState('Carlos (Mesero)');
  
  // Estado de Mesa (Solo usado en Modo Mesero)
  const [selectedMesa, setSelectedMesa] = useState(initialMesaNum || 1);
  const [mesaActualObj, setMesaActualObj] = useState(null);
  
  // Detalle de Producto Seleccionado (Consulta Cliente vs Tamaño Mesero)
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [sizeChosen, setSizeChosen] = useState('12oz');
  
  // Carrito de Comanda (Solo para Modo Mesero)
  const [cart, setCart] = useState([]);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [notas, setNotas] = useState('');
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

      const targetMesaNum = initialMesaNum || selectedMesa;
      const foundMesa = mesasData.find(m => m.numero_mesa === parseInt(targetMesaNum));
      setMesaActualObj(foundMesa || null);
    } catch (err) {
      console.error('Error al cargar menú:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [initialMesaNum]);

  const handleSelectMesa = (num) => {
    setSelectedMesa(num);
    const found = mesas.find(m => m.numero_mesa === parseInt(num));
    setMesaActualObj(found || null);
  };

  // Manejo de Carrito (Exclusivo Mesero)
  const handleAddToCartWaiters = () => {
    if (!selectedProduct) return;

    const prod = selectedProduct;
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

    setSelectedProduct(null);
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

  // Enviar Pedido a Caja (Exclusivo Mesero)
  const handleSendOrder = async () => {
    if (cart.length === 0 || modoOperacion === 'cliente') return;
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
      
      {/* BANNER PRINCIPAL DE LA MARCA */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-emerald-950/80 via-slate-950 to-pink-950/80 border border-emerald-500/30 p-6 sm:p-8 mb-6 shadow-2xl">
        <div className="absolute -right-10 -bottom-10 w-48 h-48 bg-emerald-500/10 rounded-full blur-3xl" />
        <div className="absolute -left-10 -top-10 w-48 h-48 bg-pink-500/10 rounded-full blur-3xl" />
        
        <div className="relative z-10 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-300 text-xs font-black uppercase tracking-wider border border-emerald-500/40">
                Alo Mas Agogo 🍹
              </span>
              {initialMesaNum && (
                <span className="px-3 py-1 rounded-full bg-pink-500/20 text-pink-300 text-xs font-black uppercase tracking-wider border border-pink-500/40">
                  Mesa #{initialMesaNum}
                </span>
              )}
            </div>
            <h1 className="text-3xl sm:text-5xl font-black text-white tracking-tight">
              CARTA DIGITAL <span className="bg-gradient-to-r from-emerald-400 via-cyan-300 to-pink-400 bg-clip-text text-transparent">INFORMATIVA</span>
            </h1>
            <p className="text-xs sm:text-sm text-slate-300 mt-1 max-w-xl font-medium">
              {modoOperacion === 'cliente'
                ? '📱 Explora nuestros granizados, ingredientes y precios por tamaño. Muéstrale tu elección al mesero cuando llegue a tu mesa.'
                : '🧑‍🍳 Módulo del Mesero: Selecciona la mesa y envía la comanda directamente a cocina/caja.'}
            </p>
          </div>

          {/* Selector de Modo */}
          <div className="flex bg-slate-950/90 p-1.5 rounded-2xl border border-slate-800 shrink-0">
            <button
              onClick={() => setModoOperacion('cliente')}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                modoOperacion === 'cliente'
                  ? 'bg-pink-500 text-white shadow-lg font-black'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              📱 Carta QR Consulta
            </button>
            <button
              onClick={() => setModoOperacion('mesero')}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                modoOperacion === 'mesero'
                  ? 'bg-emerald-500 text-slate-950 shadow-lg font-black'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              🧑‍🍳 Modo Mesero
            </button>
          </div>
        </div>
      </div>

      {/* BANNER 100% INFORMATIVO PARA EL CLIENTE QR */}
      {modoOperacion === 'cliente' && (
        <div className="mb-6 p-4 rounded-2xl bg-gradient-to-r from-emerald-500/10 via-cyan-500/10 to-pink-500/10 border border-emerald-500/30 flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center shrink-0 font-bold text-xl">
            🍹
          </div>
          <div>
            <h4 className="text-xs font-black text-emerald-300 uppercase tracking-wide">
              Menú{initialMesaNum ? `(Mesa #${initialMesaNum})` : ''}
            </h4>
            <p className="text-xs text-slate-300 mt-0.5 font-medium">
              Revisa nuestros sabores y precios por tamaño. Cuando el mesero llegue a tu mesa, indícale qué bebida deseas tomar.
            </p>
          </div>
        </div>
      )}

      {/* SELECCIÓN DE MESAS (EXCLUSIVO MODO MESERO) */}
      {modoOperacion === 'mesero' && (
        <div className="mb-8 p-5 rounded-3xl bg-slate-900/60 border border-slate-800">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <LayoutGrid className="w-4 h-4 text-emerald-400" />
              <h3 className="text-xs font-extrabold text-slate-300 uppercase tracking-wider">
                Mesa Seleccionada para la Comanda:
              </h3>
            </div>
            <div className="flex items-center gap-2">
              <User className="w-3.5 h-3.5 text-emerald-400" />
              <input
                type="text"
                value={meseroNombre}
                onChange={(e) => setMeseroNombre(e.target.value)}
                className="bg-slate-950 border border-slate-800 px-2.5 py-1 rounded-xl text-xs text-white outline-none font-bold"
              />
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
      )}

      {/* CONFIRMACIÓN DE PEDIDO ENVIADO (SOLO MESERO) */}
      {activeOrder && modoOperacion === 'mesero' && (
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
            <span>Granizados Con Licor 🍾</span>
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
            <span>Granizados Sin Licor 🍧</span>
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
            <span>Granizados Cremosos 🍦</span>
          </button>
        </div>

        <div className="relative min-w-[240px]">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Buscar sabor o licor..."
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
      ) : productosFiltrados.length === 0 ? (
        <div className="text-center py-16 bg-slate-900/30 rounded-3xl border border-slate-800/60">
          <GlassWater className="w-12 h-12 text-slate-600 mx-auto mb-3" />
          <p className="text-slate-400 font-medium text-sm">No se encontraron granizados en esta categoría.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {productosFiltrados.map(prod => (
            <div 
              key={prod.id}
              className="group relative bg-slate-900/70 hover:bg-slate-900 border border-slate-800 hover:border-emerald-500/50 rounded-3xl overflow-hidden transition-all duration-300 flex flex-col justify-between"
            >
              <div className="relative h-48 w-full overflow-hidden bg-slate-950">
                <img 
                  src={prod.imagen_url} 
                  alt={prod.nombre}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/20 to-transparent" />
                
                <span className={`absolute top-3 left-3 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider ${
                  prod.categoria === 'con_licor' 
                    ? 'bg-emerald-500 text-slate-950' 
                    : prod.categoria === 'sin_licor' 
                    ? 'bg-cyan-400 text-slate-950' 
                    : 'bg-pink-500 text-white'
                }`}>
                  {prod.categoria === 'con_licor' ? 'Con Licor' : prod.categoria === 'sin_licor' ? 'Sin Licor' : 'Cremoso'}
                </span>
              </div>

              <div className="p-5 flex-1 flex flex-col justify-between">
                <div>
                  <h3 className="font-extrabold text-lg text-white group-hover:text-emerald-300 transition-colors">
                    {prod.nombre}
                  </h3>
                  {prod.ingredientes && (
                    <p className="text-xs text-slate-400 mt-1 font-medium italic">
                      {prod.ingredientes}
                    </p>
                  )}

                  {/* Tabla de Precios por Tamaño en Tarjeta */}
                  <div className="mt-3 grid grid-cols-3 gap-1 text-[11px] bg-slate-950 p-2 rounded-xl border border-slate-800 text-center">
                    <div>
                      <span className="text-slate-500 block text-[9px] font-bold">8 oz</span>
                      <strong className="text-slate-200">{formatCOP(prod.precio_8oz)}</strong>
                    </div>
                    <div>
                      <span className="text-slate-500 block text-[9px] font-bold">12 oz</span>
                      <strong className="text-emerald-400">{formatCOP(prod.precio_12oz)}</strong>
                    </div>
                    <div>
                      <span className="text-slate-500 block text-[9px] font-bold">24 oz</span>
                      <strong className="text-slate-200">{formatCOP(prod.precio_24oz)}</strong>
                    </div>
                  </div>
                </div>

                <div className="mt-4 pt-3 border-t border-slate-800/80">
                  <button
                    onClick={() => {
                      setSelectedProduct(prod);
                      setSizeChosen('12oz');
                    }}
                    className="w-full py-3 bg-gradient-to-r from-emerald-500 to-cyan-400 hover:from-emerald-400 hover:to-cyan-300 text-slate-950 font-extrabold rounded-2xl text-xs flex items-center justify-center gap-2 transition-all shadow-md active:scale-95"
                  >
                    <span>{modoOperacion === 'cliente' ? '🔍 Consultar Precios por Tamaño' : '➕ Tomar Comanda para Mesero'}</span>
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* MODAL DETALLE DE PRODUCTO */}
      {selectedProduct && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md">
          <div className="w-full max-w-md bg-[#080c14] border border-emerald-500/40 rounded-3xl p-6 shadow-2xl glow-emerald">
            
            <div className="flex items-center justify-between pb-4 border-b border-slate-800">
              <div>
                <span className="text-[10px] font-black text-emerald-400 uppercase tracking-wider block">
                  {modoOperacion === 'cliente' ? 'Detalle de Bebida' : 'Seleccionar Tamaño de Comanda'}
                </span>
                <h3 className="text-xl font-extrabold text-white">{selectedProduct.nombre}</h3>
              </div>
              <button 
                onClick={() => setSelectedProduct(null)}
                className="text-slate-400 hover:text-white p-2 rounded-xl text-xs font-bold"
              >
                ✕
              </button>
            </div>

            <p className="text-xs text-slate-400 my-3 font-medium">
              Ingredientes: <em className="text-slate-200">{selectedProduct.ingredientes}</em>
            </p>

            {/* Opciones de Precios por Tamaño */}
            <div className="space-y-2.5 my-5">
              {[
                { size: '8oz', label: 'PEQUEÑO (8 oz)', price: selectedProduct.precio_8oz },
                { size: '12oz', label: 'MEDIANO (12 oz)', price: selectedProduct.precio_12oz },
                { size: '24oz', label: 'GRANDE (24 oz)', price: selectedProduct.precio_24oz },
                { size: '100oz', label: 'NEVERA (100 oz)', price: selectedProduct.precio_100oz }
              ].map(opt => (
                <div
                  key={opt.size}
                  onClick={() => setSizeChosen(opt.size)}
                  className={`w-full p-3.5 rounded-2xl border text-left flex items-center justify-between transition-all cursor-pointer ${
                    sizeChosen === opt.size
                      ? 'bg-gradient-to-r from-emerald-500/20 to-cyan-500/20 border-emerald-400 shadow-md'
                      : 'bg-slate-900/80 border-slate-800 text-slate-400 hover:border-slate-700'
                  }`}
                >
                  <span className="font-extrabold text-xs text-white">{opt.label}</span>
                  <span className="font-black text-sm text-emerald-400">{formatCOP(opt.price)}</span>
                </div>
              ))}
            </div>

            {modoOperacion === 'mesero' ? (
              <button
                onClick={handleAddToCartWaiters}
                className="w-full py-3.5 bg-gradient-to-r from-emerald-400 via-cyan-400 to-teal-400 text-slate-950 font-black rounded-2xl text-sm flex items-center justify-center gap-2 transition-all shadow-lg active:scale-95"
              >
                <span>Agregar a la Comanda (Mesa #{selectedMesa})</span>
              </button>
            ) : (
              <div className="p-3 bg-slate-900 rounded-2xl border border-slate-800 text-center">
                <p className="text-xs text-emerald-300 font-bold">
                  💡 Indícale este producto y tamaño a tu mesero para realizar tu pedido.
                </p>
              </div>
            )}

          </div>
        </div>
      )}

      {/* BARRA FLOTANTE DE COMANDA (SOLO MODO MESERO) */}
      {modoOperacion === 'mesero' && cartItemCount > 0 && (
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

      {/* DRAWER DE COMANDA (SOLO MODO MESERO) */}
      {modoOperacion === 'mesero' && isCartOpen && (
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

              {/* Lista de Ítems */}
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
