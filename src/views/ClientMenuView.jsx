import React, { useState, useEffect } from 'react';
import { Search, Sparkles, Flame, Layers, GlassWater, Wifi, ShoppingBag, Plus, Minus, Trash2, CheckCircle2, Tag, Truck, Store, MapPin, Phone, User, Info } from 'lucide-react';
import { apiService } from '../services/api';
import { useAuth } from '../context/AuthContext';

export function ClientMenuView({ mesaNum }) {
  const { negocio, formatCurrency } = useAuth();
  const [productos, setProductos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [categoriaSel, setCategoriaSel] = useState('todos');
  const [busqueda, setBusqueda] = useState('');
  
  // MODOS: 'mesa' (escaneo QR en local - 100% INFORMATIVO) vs 'delivery' (remoto / casa - PEDIDOS ONLINE)
  const isQRInformativo = Boolean(mesaNum);
  const [orderMode, setOrderMode] = useState(isQRInformativo ? 'mesa' : 'delivery');
  const [deliveryType, setDeliveryType] = useState('delivery'); // 'delivery' o 'takeaway'

  // Carrito de compras (solo activo en modo delivery)
  const [cart, setCart] = useState([]);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [orderSent, setOrderSent] = useState(false);

  // Formulario de datos para Delivery / Takeaway
  const [customerName, setCustomerName] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');
  const [customerAddress, setCustomerAddress] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('efectivo');

  // Carga de Branding & Promos
  const branding = React.useMemo(() => {
    const saved = localStorage.getItem('gst_resto_branding');
    return saved ? JSON.parse(saved) : {
      name: negocio?.nombre || 'GST Resto Bar',
      tagline: 'Coctelería de autor, hamburguesas artesanas y buenas vibras.',
      wifiName: 'RestoBar_5G',
      wifiPass: 'invitados2026',
      accent: 'amber'
    };
  }, [negocio]);

  const promos = React.useMemo(() => {
    const saved = localStorage.getItem('gst_resto_promos');
    return saved ? JSON.parse(saved) : [
      { id: 1, name: 'Happy Hour 2x1 Cocktails', type: '2x1', value: '2×1', startTime: '18:00', endTime: '21:00', active: true },
      { id: 2, name: '-20% Smash Burgers', type: 'discount', value: '20%', startTime: '12:00', endTime: '16:00', active: true }
    ];
  }, []);

  const activePromos = promos.filter(p => p.active);

  useEffect(() => {
    async function loadProducts() {
      try {
        setLoading(true);
        const data = await apiService.getProductos(negocio?.id);
        
        const enriched = data.map((prod, idx) => ({
          ...prod,
          originalPrice: prod.precio_8oz ? prod.precio_8oz * 1.25 : null,
          badge: idx % 3 === 0 ? '2x1' : idx % 2 === 0 ? '-20%' : 'POPULAR',
          badgeColor: idx % 3 === 0 ? 'bg-amber-500 text-slate-950 font-bold' : idx % 2 === 0 ? 'bg-rose-500 text-white font-bold' : 'bg-emerald-500 text-slate-950 font-bold'
        }));
        
        setProductos(enriched);
      } catch (err) {
        console.error('Error al cargar carta digital:', err);
      } finally {
        setLoading(false);
      }
    }
    loadProducts();
  }, [negocio]);

  const addToCart = (product) => {
    if (isQRInformativo || orderMode === 'mesa') return; // En QR no hay carrito
    setCart((prevCart) => {
      const existing = prevCart.find((item) => item.id === product.id);
      if (existing) {
        return prevCart.map((item) =>
          item.id === product.id ? { ...item, qty: item.qty + 1 } : item
        );
      }
      return [...prevCart, { ...product, qty: 1 }];
    });
  };

  const removeFromCart = (productId) => {
    setCart((prevCart) => prevCart.filter((item) => item.id !== productId));
  };

  const updateQty = (productId, delta) => {
    setCart((prevCart) =>
      prevCart
        .map((item) => {
          if (item.id === productId) {
            const newQty = item.qty + delta;
            return newQty > 0 ? { ...item, qty: newQty } : null;
          }
          return item;
        })
        .filter(Boolean)
    );
  };

  const totalCartPrice = cart.reduce((sum, item) => sum + (item.precio_8oz || item.precio || 0) * item.qty, 0);
  const totalCartCount = cart.reduce((sum, item) => sum + item.qty, 0);

  const productosFiltrados = productos.filter((p) => {
    const matchCat = categoriaSel === 'todos' || p.categoria === categoriaSel;
    const matchSearch =
      p.nombre.toLowerCase().includes(busqueda.toLowerCase()) ||
      (p.ingredientes && p.ingredientes.toLowerCase().includes(busqueda.toLowerCase()));
    return matchCat && matchSearch;
  });

  const handleConfirmOrder = async () => {
    if (cart.length === 0 || isQRInformativo) return;
    if (!customerName.trim()) {
      alert('Por favor ingresa tu nombre para procesar el pedido.');
      return;
    }
    if (deliveryType === 'delivery' && !customerAddress.trim()) {
      alert('Por favor ingresa la dirección de entrega.');
      return;
    }

    try {
      const itemsPayload = cart.map(i => ({
        producto_id: i.id,
        nombre: i.nombre,
        cantidad: i.qty,
        precio_unitario: i.precio_8oz || i.precio || 0,
        subtotal: i.qty * (i.precio_8oz || i.precio || 0)
      }));

      await apiService.crearPedido({
        negocio_id: negocio?.id,
        numero_mesa: deliveryType === 'delivery' ? 'DELIVERY' : 'TAKEAWAY',
        tipo_pedido: deliveryType,
        cliente_nombre: customerName,
        cliente_telefono: customerPhone,
        cliente_direccion: customerAddress,
        metodo_pago: paymentMethod,
        items: itemsPayload,
        total: totalCartPrice,
      });

      setOrderSent(true);
    } catch (err) {
      console.error('Error al procesar el pedido:', err);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 font-sans pb-28">
      
      {/* HEADER DE MARCA Y PORTADA */}
      <div className="relative h-56 sm:h-64 bg-gradient-to-t from-slate-950 via-slate-900/70 to-transparent overflow-hidden">
        <img
          src={branding.coverUrl || "https://images.unsplash.com/photo-1514933651103-005eec06c04b?auto=format&fit=crop&w=1200&q=80"}
          alt="RestoBar Cover"
          className="w-full h-full object-cover opacity-50"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-slate-950/40 via-transparent to-slate-950" />
        
        {/* FLOATING TABLE BADGE EN MESA */}
        <div className="absolute top-4 right-4 z-10 flex items-center gap-2">
          {mesaNum ? (
            <div className="px-4 py-1.5 rounded-full bg-slate-950/90 backdrop-blur-md border border-amber-500/40 text-amber-400 font-black text-xs flex items-center gap-2 shadow-2xl">
              <span className="w-2 h-2 rounded-full bg-amber-500 animate-pulse" />
              <span>📍 Mesa #{mesaNum} &bull; Menú de Consulta</span>
            </div>
          ) : (
            <div className="px-4 py-1.5 rounded-full bg-slate-950/90 backdrop-blur-md border border-emerald-500/40 text-emerald-400 font-black text-xs flex items-center gap-2 shadow-2xl">
              <Truck className="w-3.5 h-3.5" />
              <span>🛵 Domicilios & Takeaway</span>
            </div>
          )}
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-20 relative z-10 space-y-6">
        
        {/* BANNER EXPLICATIVO SI ES QR EN MESA (100% INFORMATIVO) */}
        {isQRInformativo && (
          <div className="bg-gradient-to-r from-amber-500/20 via-slate-900 to-slate-900 border border-amber-500/40 rounded-3xl p-5 shadow-2xl flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-amber-500 text-slate-950 font-black text-xl flex items-center justify-center shrink-0 shadow-lg">
              ℹ️
            </div>
            <div>
              <h3 className="text-sm font-extrabold text-white">Carta Digital de Consulta - Mesa #{mesaNum}</h3>
              <p className="text-xs text-slate-300 mt-0.5">
                Esta carta es 100% informativa. Consulta los platos, ingredientes y precios para ordenarle a tu mesero cuando visite tu mesa.
              </p>
            </div>
          </div>
        )}

        {/* TARJETA DE IDENTIDAD DEL NEGOCIO */}
        <div className="bg-slate-900/90 backdrop-blur-xl border border-slate-800 rounded-3xl p-6 shadow-2xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
          <div className="flex items-center gap-4">
            <div className="w-20 h-20 rounded-2xl bg-amber-500 border-4 border-slate-950 flex items-center justify-center font-black text-2xl text-slate-950 shadow-xl overflow-hidden shrink-0">
              {branding.logoUrl ? (
                <img src={branding.logoUrl} alt={branding.name} className="w-full h-full object-cover" />
              ) : (
                <span>{branding.name ? branding.name.substring(0, 3).toUpperCase() : 'R&B'}</span>
              )}
            </div>
            <div className="space-y-1">
              <div className="flex items-center gap-2 flex-wrap">
                <h1 className="text-xl sm:text-3xl font-black tracking-tight text-white">{branding.name}</h1>
                <span className="px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 text-[10px] font-bold border border-emerald-500/30 uppercase tracking-wider">
                  {isQRInformativo ? `● Mesa #${mesaNum}` : '🛵 Envíos a Domicilio'}
                </span>
              </div>
              <p className="text-xs sm:text-sm text-slate-400">{branding.tagline}</p>
            </div>
          </div>

          {/* Credenciales WiFi si está en la mesa */}
          {isQRInformativo && branding.wifiName && (
            <div className="bg-slate-950/80 border border-slate-800 px-4 py-2.5 rounded-2xl flex items-center gap-3 text-xs text-slate-300 w-full sm:w-auto">
              <Wifi className="w-4 h-4 text-amber-400 shrink-0" />
              <div>
                <p className="text-[10px] uppercase font-bold text-slate-500">Conexión WiFi Clientes</p>
                <p className="font-bold text-slate-200">{branding.wifiName} <span className="text-amber-400 font-normal">({branding.wifiPass})</span></p>
              </div>
            </div>
          )}
        </div>

        {/* PROMOCIONES ACTIVAS */}
        {activePromos.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {activePromos.map((promo) => (
              <div
                key={promo.id}
                className="bg-gradient-to-r from-amber-500/15 via-orange-500/10 to-transparent border border-amber-500/30 rounded-2xl p-4 flex items-center justify-between shadow-lg"
              >
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="bg-amber-500 text-slate-950 text-[10px] font-black px-2 py-0.5 rounded uppercase">🔥 Promoción</span>
                    <span className="text-xs text-slate-400 font-semibold">{promo.startTime} - {promo.endTime} hs</span>
                  </div>
                  <h3 className="text-sm font-bold text-white">{promo.name}</h3>
                  <p className="text-xs text-slate-400">Válido pidiendo en mesa o en pedidos a domicilio.</p>
                </div>
                <div className="w-12 h-12 rounded-2xl bg-amber-500 text-slate-950 font-black text-sm flex items-center justify-center shrink-0 shadow-md">
                  {promo.value}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* CONTROLES DE CATEGORÍAS Y BÚSQUEDA */}
        <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4 pt-4">
          <div className="flex items-center gap-2 overflow-x-auto pb-2 md:pb-0 scrollbar-none">
            {[
              { id: 'todos', label: 'Todos los Productos', icon: Sparkles },
              ...Array.from(new Set(productos.map((p) => p.categoria).filter(Boolean))).map((cat) => ({
                id: cat,
                label: cat.replace('_', ' '),
                icon: cat.includes('licor') ? Flame : cat.includes('crem') ? Layers : GlassWater,
              })),
            ].map((cat) => {
              const Icon = cat.icon;
              const active = categoriaSel === cat.id;
              return (
                <button
                  key={cat.id}
                  onClick={() => setCategoriaSel(cat.id)}
                  className={`px-4 py-2.5 rounded-2xl text-xs font-bold transition-all flex items-center gap-2 border shrink-0 capitalize ${
                    active
                      ? 'bg-amber-500 text-slate-950 border-amber-400 shadow-lg shadow-amber-500/20'
                      : 'bg-slate-900 text-slate-400 border-slate-800 hover:text-white hover:border-slate-700'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  <span>{cat.label}</span>
                </button>
              );
            })}
          </div>

          <div className="relative w-full md:w-80">
            <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500" />
            <input
              type="text"
              placeholder="Buscar trago, hamburguesa, ingredientes..."
              value={busqueda}
              onChange={(e) => setBusqueda(e.target.value)}
              className="w-full bg-slate-900 border border-slate-800 rounded-2xl pl-10 pr-4 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-amber-500/50 shadow-inner"
            />
          </div>
        </div>

        {/* CATÁLOGO DE PRODUCTOS */}
        {loading ? (
          <div className="py-20 text-center text-slate-500 text-xs">Cargando carta digital...</div>
        ) : productosFiltrados.length === 0 ? (
          <div className="py-16 bg-slate-900 border border-slate-800 rounded-2xl text-center text-slate-400 text-xs">
            No encontramos ningún producto que coincida con tu búsqueda.
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {productosFiltrados.map((prod) => {
              const price = prod.precio_8oz || prod.precio || 12000;
              return (
                <div
                  key={prod.id}
                  className="bg-slate-900 border border-slate-800 hover:border-slate-700 rounded-3xl overflow-hidden flex flex-col justify-between transition-all group shadow-lg"
                >
                  <div>
                    <div className="relative h-48 overflow-hidden bg-slate-950">
                      <img
                        src={prod.imagen_url || 'https://images.unsplash.com/photo-1536935338788-846bb9981813?auto=format&fit=crop&w=400&q=80'}
                        alt={prod.nombre}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                      {prod.badge && (
                        <div className={`absolute top-3 left-3 px-2.5 py-1 rounded-xl text-[10px] font-black uppercase shadow-md ${prod.badgeColor}`}>
                          {prod.badge}
                        </div>
                      )}
                      <div className="absolute top-3 right-3 bg-slate-950/80 backdrop-blur-md px-2.5 py-1 rounded-xl text-[10px] font-bold text-slate-300 border border-slate-800 uppercase">
                        {prod.categoria.replace('_', ' ')}
                      </div>
                    </div>

                    <div className="p-5 space-y-2">
                      <h3 className="font-extrabold text-base text-white group-hover:text-amber-400 transition-colors">
                        {prod.nombre}
                      </h3>
                      <p className="text-xs text-slate-400 line-clamp-2 leading-relaxed">
                        {prod.ingredientes || prod.descripcion || 'Preparación artesanal con insumos de primera calidad.'}
                      </p>
                    </div>
                  </div>

                  <div className="px-5 pb-5 pt-2 flex items-center justify-between border-t border-slate-800/60 mt-auto">
                    <div>
                      <span className="text-xs text-slate-500 block font-medium">Precio</span>
                      <div className="flex items-baseline gap-2">
                        <span className="text-lg font-black text-amber-400">
                          {formatCurrency ? formatCurrency(price) : `$${price}`}
                        </span>
                        {prod.originalPrice && (
                          <span className="text-xs text-slate-500 line-through">
                            {formatCurrency ? formatCurrency(prod.originalPrice) : `$${prod.originalPrice}`}
                          </span>
                        )}
                      </div>
                    </div>

                    {/* MOSTRAR BOTÓN AGREGAR SOLO EN MODO DOMICILIO (EN QR MESA ES 100% INFORMATIVO) */}
                    {!isQRInformativo && (
                      <button
                        onClick={() => addToCart(prod)}
                        className="px-4 py-2 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold rounded-xl text-xs flex items-center gap-1.5 shadow-lg shadow-amber-500/20 active:scale-95 transition-all"
                      >
                        <Plus className="w-4 h-4" />
                        <span>Agregar</span>
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}

      </div>

      {/* DRAWER FLOTANTE DE CARRITO (SOLO PARA DOMICILIOS) */}
      {!isQRInformativo && cart.length > 0 && (
        <div className="fixed bottom-4 left-4 right-4 max-w-lg mx-auto z-40">
          <div className="bg-slate-900/95 backdrop-blur-xl border border-amber-500/40 p-4 rounded-3xl shadow-2xl flex items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="w-11 h-11 rounded-2xl bg-amber-500 text-slate-950 font-black text-base flex items-center justify-center shadow-lg">
                {totalCartCount}
              </div>
              <div>
                <p className="text-xs text-slate-400 font-medium">Tu Pedido a Domicilio</p>
                <p className="text-base font-black text-white">
                  {formatCurrency ? formatCurrency(totalCartPrice) : `$${totalCartPrice}`}
                </p>
              </div>
            </div>

            <button
              onClick={() => setIsCartOpen(true)}
              className="px-5 py-2.5 bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-xs rounded-2xl shadow-lg flex items-center gap-2 transition-all"
            >
              <ShoppingBag className="w-4 h-4" />
              <span>Ver Pedido →</span>
            </button>
          </div>
        </div>
      )}

      {/* MODAL CHECKOUT COMPLETO (SOLO PARA DOMICILIOS) */}
      {!isQRInformativo && isCartOpen && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex items-end sm:items-center justify-center p-0 sm:p-4">
          <div className="bg-slate-900 border border-slate-800 w-full max-w-lg rounded-t-3xl sm:rounded-3xl p-6 space-y-6 shadow-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center pb-4 border-b border-slate-800">
              <div>
                <h3 className="text-lg font-black text-white">Confirmación de Pedido a Domicilio</h3>
                <p className="text-xs text-slate-400">Revisa los datos de envío antes de procesar</p>
              </div>
              <button
                onClick={() => setIsCartOpen(false)}
                className="w-8 h-8 rounded-full bg-slate-800 text-slate-400 font-bold flex items-center justify-center hover:text-white"
              >
                ✕
              </button>
            </div>

            {orderSent ? (
              <div className="py-12 text-center space-y-3">
                <div className="w-16 h-16 rounded-full bg-emerald-500/20 text-emerald-400 mx-auto flex items-center justify-center">
                  <CheckCircle2 className="w-10 h-10" />
                </div>
                <h4 className="text-xl font-bold text-white">¡Pedido Enviado a la Caja!</h4>
                <p className="text-xs text-slate-400 max-w-xs mx-auto">
                  Tu pedido de {deliveryType === 'delivery' ? 'Domicilio' : 'Retiro en Local'} fue registrado correctamente.
                </p>
                <button
                  onClick={() => {
                    setCart([]);
                    setOrderSent(false);
                    setIsCartOpen(false);
                  }}
                  className="px-6 py-2.5 bg-amber-500 text-slate-950 font-bold rounded-xl text-xs mt-4"
                >
                  Entendido
                </button>
              </div>
            ) : (
              <>
                <div className="space-y-4 bg-slate-950 p-4 rounded-2xl border border-slate-800">
                  <div className="grid grid-cols-2 gap-2 p-1 bg-slate-900 rounded-xl border border-slate-800">
                    <button
                      type="button"
                      onClick={() => setDeliveryType('delivery')}
                      className={`py-2 rounded-lg text-xs font-bold flex items-center justify-center gap-1.5 transition-all ${
                        deliveryType === 'delivery'
                          ? 'bg-amber-500 text-slate-950 shadow-md'
                          : 'text-slate-400 hover:text-white'
                      }`}
                    >
                      <Truck className="w-3.5 h-3.5" />
                      <span>Domicilio</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => setDeliveryType('takeaway')}
                      className={`py-2 rounded-lg text-xs font-bold flex items-center justify-center gap-1.5 transition-all ${
                        deliveryType === 'takeaway'
                          ? 'bg-amber-500 text-slate-950 shadow-md'
                          : 'text-slate-400 hover:text-white'
                      }`}
                    >
                      <Store className="w-3.5 h-3.5" />
                      <span>Retiro en Local</span>
                    </button>
                  </div>

                  <div className="space-y-3 text-xs">
                    <div>
                      <label className="block text-slate-400 font-bold mb-1">Nombre Completo *</label>
                      <input
                        type="text"
                        placeholder="Ej. Juan Pérez"
                        value={customerName}
                        onChange={(e) => setCustomerName(e.target.value)}
                        className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-white focus:border-amber-500 outline-none"
                      />
                    </div>

                    <div>
                      <label className="block text-slate-400 font-bold mb-1">Teléfono / WhatsApp *</label>
                      <input
                        type="tel"
                        placeholder="Ej. 300 123 4567"
                        value={customerPhone}
                        onChange={(e) => setCustomerPhone(e.target.value)}
                        className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-white focus:border-amber-500 outline-none"
                      />
                    </div>

                    {deliveryType === 'delivery' && (
                      <div>
                        <label className="block text-slate-400 font-bold mb-1">Dirección de Entrega *</label>
                        <input
                          type="text"
                          placeholder="Barrio, Calle, Número de Casa/Apto, Referencias..."
                          value={customerAddress}
                          onChange={(e) => setCustomerAddress(e.target.value)}
                          className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-white focus:border-amber-500 outline-none"
                        />
                      </div>
                    )}
                  </div>
                </div>

                <div className="space-y-3">
                  {cart.map((item) => {
                    const price = item.precio_8oz || item.precio || 0;
                    return (
                      <div key={item.id} className="flex items-center justify-between p-3 bg-slate-950 rounded-2xl border border-slate-800">
                        <div className="min-w-0 pr-2">
                          <h4 className="font-bold text-sm text-white truncate">{item.nombre}</h4>
                          <p className="text-xs text-amber-400 font-semibold">
                            {formatCurrency ? formatCurrency(price) : `$${price}`} c/u
                          </p>
                        </div>

                        <div className="flex items-center gap-3">
                          <div className="flex items-center gap-2 bg-slate-900 border border-slate-800 px-2 py-1 rounded-xl text-xs">
                            <button onClick={() => updateQty(item.id, -1)} className="p-1 text-slate-400 hover:text-white">
                              <Minus className="w-3.5 h-3.5" />
                            </button>
                            <span className="font-bold text-white px-1">{item.qty}</span>
                            <button onClick={() => updateQty(item.id, 1)} className="p-1 text-slate-400 hover:text-white">
                              <Plus className="w-3.5 h-3.5" />
                            </button>
                          </div>

                          <button onClick={() => removeFromCart(item.id)} className="text-slate-500 hover:text-rose-400 p-1">
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>

                <div className="pt-4 border-t border-slate-800 space-y-4">
                  <div className="flex justify-between items-center text-sm font-bold text-white">
                    <span>Total Pedido</span>
                    <span className="text-xl text-amber-400">
                      {formatCurrency ? formatCurrency(totalCartPrice) : `$${totalCartPrice}`}
                    </span>
                  </div>

                  <button
                    onClick={handleConfirmOrder}
                    className="w-full py-3 bg-amber-500 hover:bg-amber-400 text-slate-950 font-black rounded-2xl shadow-xl text-sm"
                  >
                    Confirmar Pedido a Domicilio / Retiro
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      )}

    </div>
  );
}

export default ClientMenuView;
