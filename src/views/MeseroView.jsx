import React, { useState, useEffect } from 'react';
import { 
  ShoppingBag, Search, Plus, Minus, Trash2, CheckCircle2, 
  Sparkles, Wine, GlassWater, Flame, Layers, LayoutGrid, Check, ArrowRight, User, RefreshCw, X, Clock, AlertTriangle, Beer, CheckCircle, RotateCcw
} from 'lucide-react';
import { apiService } from '../services/api';
import { useAuth } from '../context/AuthContext';

const STATUS_CFG = {
  libre: { label: 'Libre', color: '#22C55E', bg: 'rgba(34,197,94,0.12)', ring: 'rgba(34,197,94,0.35)', icon: '✓' },
  ocupada: { label: 'Ocupada', color: '#F59E0B', bg: 'rgba(245,158,11,0.12)', ring: 'rgba(245,158,11,0.35)', icon: '●' },
  precuenta: { label: 'Pre-cuenta', color: '#3B82F6', bg: 'rgba(59,130,246,0.12)', ring: 'rgba(59,130,246,0.35)', icon: '🧾' },
  limpieza: { label: 'Limpieza', color: '#EF4444', bg: 'rgba(239,68,68,0.12)', ring: 'rgba(239,68,68,0.35)', icon: '🧹' },
};

const ZONES = [
  { id: 'all', label: 'Todas las Mesas' },
  { id: 'sala', label: 'Sala Principal' },
  { id: 'terraza', label: 'Terraza Outdoor' },
  { id: 'barra', label: '🍹 Barra Express (Pedidos Directos)' },
];

export function MeseroView() {
  const { profile, negocio, formatCurrency } = useAuth();
  const [productos, setProductos] = useState([]);
  const [mesas, setMesas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [busqueda, setBusqueda] = useState('');
  const [zoneSel, setZoneSel] = useState('all');
  
  // Identificador de Mesero
  const [meseroNombre, setMeseroNombre] = useState(profile?.nombre || 'Mesero');
  
  // Estado de Mesa Seleccionada
  const [selectedMesa, setSelectedMesa] = useState(1);
  const [selectedMesaObj, setSelectedMesaObj] = useState(null);

  // Pedidos Directos de Barra (Bar Tabs)
  const [barOrders, setBarOrders] = useState([
    { id: 'bar-1', title: 'Barra Tab #1 (Mojitos)', items: [{ name: 'Mojito Maracuyá', qty: 2, price: 9500 }], status: 'preparando', time: '5m ago' },
    { id: 'bar-2', title: 'Barra Tab #2 (Cervezas)', items: [{ name: 'Cerveza Artesanal', qty: 3, price: 8000 }], status: 'listo', time: '12m ago' }
  ]);
  const [selectedBarTab, setSelectedBarTab] = useState('bar-1');

  // Carrito de Comanda
  const [cart, setCart] = useState([]);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [notas, setNotas] = useState('');
  
  // Estado del Envío
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [orderSuccess, setOrderSuccess] = useState(false);

  // Cargar mesas y productos
  const loadData = async () => {
    try {
      setLoading(true);
      const tenantId = negocio?.id;
      const [prodsData, mesasBackend] = await Promise.all([
        apiService.getProductos(tenantId),
        apiService.getMesas(tenantId)
      ]);
      setProductos(prodsData);

      let formattedMesas = mesasBackend.map((m, idx) => {
        const zone = idx < 6 ? 'sala' : 'terraza';
        const status = idx % 4 === 1 ? 'ocupada' : idx % 5 === 2 ? 'precuenta' : idx % 7 === 0 ? 'limpieza' : 'libre';
        return {
          ...m,
          zone,
          status,
          seats: m.capacidad || 4,
          since: status !== 'libre' ? Date.now() - (idx + 1) * 12 * 60000 : null
        };
      });

      if (formattedMesas.length === 0) {
        formattedMesas = Array.from({ length: 12 }, (_, i) => ({
          id: i + 1,
          numero_mesa: i + 1,
          codigo_qr: `MESA-${i + 1}`,
          capacidad: i % 3 === 0 ? 6 : 4,
          zone: i < 6 ? 'sala' : 'terraza',
          status: i === 0 || i === 3 ? 'ocupada' : i === 1 ? 'precuenta' : i === 4 ? 'limpieza' : 'libre',
          since: (i === 0 || i === 3) ? Date.now() - (i + 1) * 15 * 60000 : null
        }));
      }

      setMesas(formattedMesas);
      setSelectedMesaObj(formattedMesas.find(m => m.numero_mesa === selectedMesa) || formattedMesas[0]);
    } catch (err) {
      console.error('Error al cargar vista mesero:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (profile?.nombre) setMeseroNombre(profile.nombre);
  }, [profile]);

  useEffect(() => {
    loadData();
  }, [negocio]);

  // FUNCIÓN PARA CAMBIAR ESTADO DE MESA MANUALMENTE
  const handleStatusChange = (numeroMesa, newStatus) => {
    setMesas(prev => prev.map(m => {
      if (m.numero_mesa === numeroMesa) {
        return {
          ...m,
          status: newStatus,
          since: newStatus === 'libre' ? null : (m.since || Date.now())
        };
      }
      return m;
    }));

    if (selectedMesaObj && selectedMesaObj.numero_mesa === numeroMesa) {
      setSelectedMesaObj(prev => ({
        ...prev,
        status: newStatus,
        since: newStatus === 'libre' ? null : (prev.since || Date.now())
      }));
    }
  };

  const handleSelectMesa = (mesa) => {
    setSelectedMesa(mesa.numero_mesa);
    setSelectedMesaObj(mesa);
  };

  // Crear nueva comanda rápida en barra
  const handleCreateBarTab = () => {
    const newId = `bar-${Date.now()}`;
    const newTab = {
      id: newId,
      title: `Barra Tab #${barOrders.length + 1}`,
      items: [],
      status: 'preparando',
      time: 'Justo ahora'
    };
    setBarOrders([newTab, ...barOrders]);
    setSelectedBarTab(newId);
  };

  const handleAddToCartDirect = (producto) => {
    const price = producto.precio_12oz || producto.precio || 12000;
    setCart(prev => {
      const existing = prev.find(item => item.producto.id === producto.id && item.tamano === '12oz');
      if (existing) {
        return prev.map(item => item.producto.id === producto.id ? { ...item, cantidad: item.cantidad + 1 } : item);
      }
      return [...prev, { producto, tamano: '12oz', cantidad: 1, precio_unitario: price }];
    });
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

  const calculateCartTotal = () => {
    return cart.reduce((sum, item) => sum + item.precio_unitario * item.cantidad, 0);
  };

  const handleEnviarPedido = async () => {
    if (cart.length === 0) return;
    setIsSubmitting(true);
    try {
      const itemsPayload = cart.map(i => ({
        producto_id: i.producto.id,
        nombre: i.producto.nombre,
        tamano: i.tamano,
        cantidad: i.cantidad,
        precio_unitario: i.precio_unitario,
        subtotal: i.cantidad * i.precio_unitario
      }));

      await apiService.crearPedido({
        negocio_id: negocio?.id,
        numero_mesa: zoneSel === 'barra' ? 'BARRA' : selectedMesa,
        mesero_nombre: meseroNombre,
        items: itemsPayload,
        total: calculateCartTotal(),
        notas
      });

      if (zoneSel !== 'barra') {
        handleStatusChange(selectedMesa, 'ocupada');
      }

      setOrderSuccess(true);
      setCart([]);
      setNotas('');
      setTimeout(() => {
        setOrderSuccess(false);
        setIsCartOpen(false);
      }, 1500);
    } catch (err) {
      console.error('Error al enviar pedido:', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const mesasFiltradas = mesas.filter(m => zoneSel === 'all' || m.zone === zoneSel);

  const elapsed = (since) => {
    if (!since) return null;
    const mins = Math.floor((Date.now() - since) / 60000);
    if (mins < 60) return `${mins}m`;
    return `${Math.floor(mins / 60)}h ${mins % 60}m`;
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 font-sans pb-28">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
        
        {/* HEADER BAR CON SELECTOR DE ZONAS */}
        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-5 shadow-xl flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-amber-500 text-slate-950 flex items-center justify-center font-black text-xl shadow-lg">
              📋
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-xl font-black text-white">Comandero POS & Control de Mesas</h1>
                <span className="px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 text-[10px] font-bold border border-emerald-500/30 uppercase">
                  ● EN VIVO
                </span>
              </div>
              <p className="text-xs text-slate-400">Atendiendo como: <span className="text-amber-400 font-bold">{meseroNombre}</span></p>
            </div>
          </div>

          {/* Quick Zone Selector */}
          <div className="flex gap-1.5 bg-slate-950 p-1.5 rounded-2xl border border-slate-800 overflow-x-auto w-full md:w-auto">
            {ZONES.map(z => (
              <button
                key={z.id}
                onClick={() => setZoneSel(z.id)}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all shrink-0 ${
                  zoneSel === z.id
                    ? 'bg-amber-500 text-slate-950 shadow-md'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                {z.label}
              </button>
            ))}
          </div>
        </div>

        {/* SI ESTÁ SELECCIONADA LA ZONA DE BARRA: VISTA EXPRES DE BARRA */}
        {zoneSel === 'barra' ? (
          <div className="space-y-6">
            <div className="bg-gradient-to-r from-amber-500/10 via-slate-900 to-slate-900 border border-amber-500/30 rounded-3xl p-6 shadow-xl flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <Beer className="w-5 h-5 text-amber-400" />
                  <h2 className="text-lg font-black text-white">Módulo de Pedidos Rápidos en Barra</h2>
                </div>
                <p className="text-xs text-slate-400">Toma pedidos directo en la barra sin necesidad de asignar número de mesa física.</p>
              </div>

              <button
                onClick={handleCreateBarTab}
                className="px-5 py-2.5 bg-amber-500 hover:bg-amber-400 text-slate-950 font-extrabold rounded-2xl text-xs flex items-center gap-2 shadow-lg transition-all"
              >
                <Plus className="w-4 h-4" />
                <span>+ Abrir Nuevo Pedido en Barra</span>
              </button>
            </div>

            {/* BAR TABS LIST */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {barOrders.map((tab) => {
                const totalTab = tab.items.reduce((s, i) => s + i.qty * i.price, 0);
                const isSel = selectedBarTab === tab.id;
                return (
                  <div
                    key={tab.id}
                    onClick={() => setSelectedBarTab(tab.id)}
                    className={`p-5 rounded-3xl border transition-all cursor-pointer space-y-4 shadow-lg ${
                      isSel ? 'border-amber-500 bg-slate-900 ring-2 ring-amber-500/40' : 'border-slate-800 bg-slate-900/60 hover:border-slate-700'
                    }`}
                  >
                    <div className="flex justify-between items-center">
                      <div className="flex items-center gap-2">
                        <span className="w-2.5 h-2.5 rounded-full bg-amber-500 animate-pulse" />
                        <h3 className="font-extrabold text-sm text-white">{tab.title}</h3>
                      </div>
                      <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-slate-950 text-slate-400 border border-slate-800">
                        {tab.time}
                      </span>
                    </div>

                    <div className="space-y-1 bg-slate-950 p-3 rounded-2xl border border-slate-800/80">
                      {tab.items.length === 0 ? (
                        <p className="text-xs text-slate-500 italic">Sin productos en este pedido de barra aún</p>
                      ) : (
                        tab.items.map((item, idx) => (
                          <div key={idx} className="flex justify-between text-xs text-slate-300">
                            <span>{item.qty}x {item.name}</span>
                            <span className="font-bold text-amber-400">{formatCurrency ? formatCurrency(item.qty * item.price) : `$${item.qty * item.price}`}</span>
                          </div>
                        ))
                      )}
                    </div>

                    <div className="flex justify-between items-center pt-1 text-xs">
                      <span className="text-slate-400 font-semibold">Total Acumulado</span>
                      <span className="text-base font-black text-amber-400">
                        {formatCurrency ? formatCurrency(totalTab) : `$${totalTab}`}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        ) : (
          /* VISTA NORMAL DE PLANO DE MESAS CON SELECTOR DE ESTADOS */
          <div className="space-y-4">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 px-1">
              <div>
                <h2 className="text-sm font-bold uppercase tracking-wider text-slate-400">Plano General de Mesas ({mesasFiltradas.length})</h2>
                <p className="text-xs text-slate-500">Selecciona una mesa para cambiar su estado o tomar pedido.</p>
              </div>

              <div className="flex items-center gap-3 text-xs flex-wrap">
                <span className="flex items-center gap-1 text-emerald-400 font-bold"><span className="w-2 h-2 rounded-full bg-emerald-500" /> Libre</span>
                <span className="flex items-center gap-1 text-amber-400 font-bold"><span className="w-2 h-2 rounded-full bg-amber-500" /> Ocupada</span>
                <span className="flex items-center gap-1 text-blue-400 font-bold"><span className="w-2 h-2 rounded-full bg-blue-500" /> Pre-cuenta</span>
                <span className="flex items-center gap-1 text-rose-400 font-bold"><span className="w-2 h-2 rounded-full bg-rose-500" /> Limpieza</span>
              </div>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-4 gap-4">
              {mesasFiltradas.map((mesa) => {
                const cfg = STATUS_CFG[mesa.status] || STATUS_CFG.libre;
                const isSelected = selectedMesa === mesa.numero_mesa;
                const timeAgo = elapsed(mesa.since);

                return (
                  <div
                    key={mesa.id || mesa.numero_mesa}
                    onClick={() => handleSelectMesa(mesa)}
                    className={`p-4 rounded-3xl border transition-all cursor-pointer relative overflow-hidden flex flex-col justify-between h-36 shadow-lg ${
                      isSelected
                        ? 'border-amber-500 bg-slate-900 ring-2 ring-amber-500/50 scale-[1.02]'
                        : 'border-slate-800 bg-slate-900/60 hover:border-slate-700'
                    }`}
                  >
                    <div className="flex justify-between items-start">
                      <div>
                        <span className="text-xs font-bold uppercase text-slate-500 block">Mesa</span>
                        <h3 className="text-xl font-black text-white">#{mesa.numero_mesa}</h3>
                      </div>
                      <span
                        className="px-2 py-1 rounded-xl text-[10px] font-black uppercase border flex items-center gap-1 shadow-sm"
                        style={{ color: cfg.color, backgroundColor: cfg.bg, borderColor: cfg.ring }}
                      >
                        <span>{cfg.icon}</span>
                        <span>{cfg.label}</span>
                      </span>
                    </div>

                    <div className="flex justify-between items-end text-xs text-slate-400 pt-2 border-t border-slate-800/60">
                      <span className="text-[11px] font-semibold">👥 {mesa.seats} p.</span>
                      {timeAgo && (
                        <span className="font-mono text-[10px] font-bold px-2 py-0.5 rounded-lg bg-slate-950 border border-slate-800 text-amber-400">
                          ⏱️ {timeAgo}
                        </span>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* ACCIONES SOBRE LA MESA SELECCIONADA Y SELECTOR RÁPIDO DE ESTADO */}
        {selectedMesaObj && (
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-5 space-y-6 shadow-xl">
            
            {/* ENCABEZADO MESA + SELECTOR DE ESTADOS */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 pb-4 border-b border-slate-800">
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold text-amber-500 uppercase tracking-wider">Mesa Seleccionada</span>
                  <span className="text-xs text-slate-500 font-mono">#{selectedMesaObj.numero_mesa}</span>
                </div>
                <h3 className="text-xl font-black text-white">Mesa #{selectedMesaObj.numero_mesa} ({selectedMesaObj.zone.toUpperCase()})</h3>
              </div>

              {/* BOTONES DIRECTOS PARA CAMBIAR ESTADO DE LA MESA */}
              <div className="space-y-1.5 w-full md:w-auto">
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">Cambiar Estado de la Mesa:</span>
                <div className="flex items-center gap-1.5 overflow-x-auto pb-1">
                  {Object.entries(STATUS_CFG).map(([statusKey, cfg]) => {
                    const isActive = selectedMesaObj.status === statusKey;
                    return (
                      <button
                        key={statusKey}
                        onClick={() => handleStatusChange(selectedMesaObj.numero_mesa, statusKey)}
                        className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all border flex items-center gap-1.5 shrink-0 ${
                          isActive
                            ? 'shadow-lg scale-105 font-black ring-2 ring-white/20'
                            : 'opacity-70 hover:opacity-100 hover:scale-100'
                        }`}
                        style={{
                          backgroundColor: isActive ? cfg.color : cfg.bg,
                          color: isActive ? '#020617' : cfg.color,
                          borderColor: cfg.ring,
                        }}
                      >
                        <span>{cfg.icon}</span>
                        <span>{cfg.label}</span>
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* CATÁLOGO EMBEBIDO PARA AGREGAR PRODUCTOS A LA COMANDA */}
            <div className="space-y-4">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400">Toma de Pedido & Catálogo</h4>
                
                <div className="flex items-center gap-3 w-full sm:w-auto">
                  <div className="relative flex-1 sm:w-64">
                    <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
                    <input
                      type="text"
                      placeholder="Buscar trago o comida..."
                      value={busqueda}
                      onChange={(e) => setBusqueda(e.target.value)}
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-8 pr-3 py-1.5 text-xs text-white placeholder-slate-500"
                    />
                  </div>

                  <button
                    onClick={() => setIsCartOpen(true)}
                    className="px-4 py-2 bg-amber-500 hover:bg-amber-400 text-slate-950 font-black rounded-xl text-xs flex items-center gap-1.5 shadow-md shrink-0"
                  >
                    <ShoppingBag className="w-4 h-4" />
                    <span>Ver Comanda ({cart.length})</span>
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 max-h-72 overflow-y-auto pr-1">
                {productos
                  .filter((p) => p.nombre.toLowerCase().includes(busqueda.toLowerCase()))
                  .map((prod) => {
                    const price = prod.precio_12oz || prod.precio || 12000;
                    return (
                      <div
                        key={prod.id}
                        onClick={() => handleAddToCartDirect(prod)}
                        className="p-3 bg-slate-950 border border-slate-800 hover:border-amber-500/50 rounded-2xl flex items-center justify-between cursor-pointer transition-all group"
                      >
                        <div className="min-w-0 pr-2">
                          <h5 className="font-bold text-xs text-white group-hover:text-amber-400 truncate">{prod.nombre}</h5>
                          <span className="text-xs font-black text-amber-400">
                            {formatCurrency ? formatCurrency(price) : `$${price}`}
                          </span>
                        </div>
                        <button className="w-7 h-7 rounded-xl bg-amber-500/10 text-amber-400 group-hover:bg-amber-500 group-hover:text-slate-950 font-bold text-sm flex items-center justify-center transition-all shrink-0">
                          +
                        </button>
                      </div>
                    );
                  })}
              </div>
            </div>

          </div>
        )}

      </div>

      {/* CAJÓN COMANDA Y NOTIFICACIÓN */}
      {isCartOpen && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex items-end sm:items-center justify-center p-0 sm:p-4">
          <div className="bg-slate-900 border border-slate-800 w-full max-w-lg rounded-t-3xl sm:rounded-3xl p-6 space-y-6 shadow-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center pb-4 border-b border-slate-800">
              <div>
                <h3 className="text-lg font-black text-white">Comanda Mesa #{selectedMesa}</h3>
                <p className="text-xs text-slate-400">Atendido por: {meseroNombre}</p>
              </div>
              <button
                onClick={() => setIsCartOpen(false)}
                className="w-8 h-8 rounded-full bg-slate-800 text-slate-400 font-bold flex items-center justify-center hover:text-white"
              >
                ✕
              </button>
            </div>

            {orderSuccess ? (
              <div className="py-12 text-center space-y-3">
                <div className="w-16 h-16 rounded-full bg-emerald-500/20 text-emerald-400 mx-auto flex items-center justify-center">
                  <CheckCircle2 className="w-10 h-10" />
                </div>
                <h4 className="text-xl font-bold text-white">¡Comanda Enviada a Cocina!</h4>
                <p className="text-xs text-slate-400">La mesa #{selectedMesa} ha quedado marcada como Ocupada.</p>
              </div>
            ) : cart.length === 0 ? (
              <div className="py-12 text-center text-slate-500 text-xs">
                No has agregado productos a la comanda aún.
              </div>
            ) : (
              <>
                <div className="space-y-3">
                  {cart.map((item) => (
                    <div key={item.producto.id} className="flex items-center justify-between p-3 bg-slate-950 rounded-2xl border border-slate-800">
                      <div>
                        <h4 className="font-bold text-xs text-white">{item.producto.nombre}</h4>
                        <span className="text-xs text-amber-400 font-bold">
                          {formatCurrency ? formatCurrency(item.precio_unitario) : `$${item.precio_unitario}`} c/u
                        </span>
                      </div>

                      <div className="flex items-center gap-3">
                        <div className="flex items-center gap-2 bg-slate-900 border border-slate-800 px-2 py-1 rounded-xl text-xs">
                          <button onClick={() => updateQuantity(item.producto.id, item.tamano, -1)} className="p-1 text-slate-400 hover:text-white">
                            <Minus className="w-3.5 h-3.5" />
                          </button>
                          <span className="font-bold text-white px-1">{item.cantidad}</span>
                          <button onClick={() => updateQuantity(item.producto.id, item.tamano, 1)} className="p-1 text-slate-400 hover:text-white">
                            <Plus className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-400 mb-1">Notas especiales para cocina / barra</label>
                  <textarea
                    value={notas}
                    onChange={(e) => setNotas(e.target.value)}
                    placeholder="Ej. Sin hielo, poco picante, cliente alérgico..."
                    className="w-full bg-slate-950 border border-slate-800 rounded-2xl p-3 text-xs text-white focus:outline-none focus:border-amber-500"
                    rows={2}
                  />
                </div>

                <div className="pt-4 border-t border-slate-800 space-y-4">
                  <div className="flex justify-between items-center text-sm font-bold text-white">
                    <span>Total Comanda</span>
                    <span className="text-xl text-amber-400">
                      {formatCurrency ? formatCurrency(calculateCartTotal()) : `$${calculateCartTotal()}`}
                    </span>
                  </div>

                  <button
                    onClick={handleEnviarPedido}
                    disabled={isSubmitting}
                    className="w-full py-3 bg-amber-500 hover:bg-amber-400 text-slate-950 font-black rounded-2xl shadow-xl text-sm"
                  >
                    {isSubmitting ? 'Enviando...' : 'Enviar Comanda a Cocina / Caja'}
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

export default MeseroView;
