import React, { useState, useEffect } from 'react';
import { 
  Volume2, VolumeX, BellRing, Clock, ChefHat, CheckCircle2, 
  Receipt, Sparkles, Filter, Search, ArrowRight, RefreshCw,
  Beer, Plus, LayoutDashboard, GlassWater
} from 'lucide-react';
import { apiService } from '../services/api';
import { audioAlert } from '../utils/audioAlert';
import { FacturaModal } from './FacturaModal';
import { useAuth } from '../context/AuthContext';

export function CajaView() {
  const { negocio, formatCurrency } = useAuth();
  const [pedidos, setPedidos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isMuted, setIsMuted] = useState(false);
  const [filtroMesa, setFiltroMesa] = useState('');
  
  // MODOS DE VISTA: 'kanban' (Tablero de Pedidos & Cocina) vs 'barra' (Módulo Barra Express)
  const [activeSubTab, setActiveSubTab] = useState('kanban');

  // Estado para Módulo Barra Express (Bar Tabs)
  const [barOrders, setBarOrders] = useState([
    { id: 'bar-1', title: 'Barra Tab #1 (Mojitos)', items: [{ name: 'Mojito Maracuyá', qty: 2, price: 9500 }], status: 'preparando', time: '5m ago' },
    { id: 'bar-2', title: 'Barra Tab #2 (Cervezas)', items: [{ name: 'Cerveza Artesanal', qty: 3, price: 8000 }], status: 'listo', time: '12m ago' }
  ]);
  const [selectedBarTab, setSelectedBarTab] = useState('bar-1');

  // Estado para Modal de Facturación
  const [orderToBill, setOrderToBill] = useState(null);

  // Cargar Pedidos Iniciales por Tenant
  const loadPedidos = async () => {
    try {
      setLoading(true);
      const data = await apiService.getPedidos({}, negocio?.id);
      setPedidos(data);
    } catch (err) {
      console.error('Error al cargar pedidos en caja:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadPedidos();

    // Suscripción Realtime aislada por negocio_id
    const unsubscribe = apiService.subscribeToPedidos(
      (newOrder) => {
        audioAlert.playNewOrderSound();
        setPedidos(prev => [newOrder, ...prev]);
      },
      (updatedOrder) => {
        setPedidos(prev =>
          prev.map(p => (p.id === updatedOrder.id ? { ...p, ...updatedOrder } : p))
        );
      },
      negocio?.id
    );

    return () => {
      if (unsubscribe) unsubscribe();
    };
  }, [negocio]);

  const handleToggleMute = () => {
    const muted = audioAlert.toggleMute();
    setIsMuted(muted);
  };

  const handleCambiarEstado = async (pedidoId, nuevoEstado) => {
    try {
      await apiService.actualizarEstadoPedido(pedidoId, nuevoEstado);
      setPedidos(prev =>
        prev.map(p => (p.id === pedidoId ? { ...p, estado: nuevoEstado } : p))
      );
    } catch (err) {
      console.error('Error cambiando estado de pedido:', err);
    }
  };

  const handleOrderFacturado = (pedidoId) => {
    setPedidos(prev =>
      prev.map(p => (p.id === pedidoId ? { ...p, estado: 'facturado' } : p))
    );
  };

  // Handlers para Barra Express
  const handleCreateBarTab = () => {
    const newTab = {
      id: `bar-${Date.now()}`,
      title: `Barra Tab #${barOrders.length + 1}`,
      items: [],
      status: 'abierto',
      time: 'Hace un momento'
    };
    setBarOrders([newTab, ...barOrders]);
    setSelectedBarTab(newTab.id);
  };

  const handleCobrarBarTab = (tab) => {
    const totalTab = tab.items.reduce((s, i) => s + i.qty * i.price, 0);
    const mockBarPedido = {
      id: tab.id,
      numero_mesa: tab.title,
      total: totalTab,
      estado: 'entregado',
      notas: `[Barra Express] ${tab.title}`,
      detalles: tab.items.map(i => ({
        cantidad: i.qty,
        producto: { nombre: i.name, precio: i.price },
        precio_unitario: i.price
      }))
    };
    setOrderToBill(mockBarPedido);
  };

  // Filtrado de Pedidos
  const pedidosFiltrados = pedidos.filter(p => {
    if (!filtroMesa) return true;
    const numMesa = p.mesas?.numero_mesa || p.numero_mesa || '';
    return numMesa.toString() === filtroMesa;
  });

  const pendientes = pedidosFiltrados.filter(p => p.estado === 'pendiente');
  const enPreparacion = pedidosFiltrados.filter(p => p.estado === 'en_preparacion');
  const entregados = pedidosFiltrados.filter(p => p.estado === 'entregado');
  const facturados = pedidosFiltrados.filter(p => p.estado === 'facturado');

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 pb-20">
      
      {/* HEADER DASHBOARD DE CAJA Y COCINA CON SELECTOR DE VISTA */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 rounded-2xl shadow-sm transition-colors duration-200">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-emerald-500 text-slate-950 flex items-center justify-center font-black text-xl shrink-0 shadow-sm">
            🖥️
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl sm:text-2xl font-extrabold text-slate-900 dark:text-white">Dashboard de Caja & Barra</h1>
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              {negocio?.nombre || 'GST Resto Bar'} &bull; Control en Tiempo Real vía Supabase Realtime
            </p>
          </div>
        </div>

        {/* CONTROLES Y PESTAÑAS DE VISTA */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
          
          <div className="flex items-center bg-slate-100 dark:bg-slate-950 p-1.5 rounded-xl border border-slate-200 dark:border-slate-800">
            <button
              onClick={() => setActiveSubTab('kanban')}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-2 ${
                activeSubTab === 'kanban'
                  ? 'bg-emerald-500 text-slate-950 shadow-md'
                  : 'text-slate-600 dark:text-slate-400 hover:text-white'
              }`}
            >
              <LayoutDashboard className="w-3.5 h-3.5" />
              <span>Pedidos & Cocina ({pendientes.length})</span>
            </button>

            <button
              onClick={() => setActiveSubTab('barra')}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-2 ${
                activeSubTab === 'barra'
                  ? 'bg-amber-500 text-slate-950 shadow-md'
                  : 'text-slate-600 dark:text-slate-400 hover:text-white'
              }`}
            >
              <Beer className="w-3.5 h-3.5" />
              <span>Barra Express</span>
            </button>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleToggleMute}
              className={`p-2.5 rounded-xl border text-xs font-bold transition-all flex items-center gap-2 ${
                isMuted
                  ? 'bg-rose-50 dark:bg-rose-950/40 text-rose-600 dark:text-rose-400 border-rose-200 dark:border-rose-900/60'
                  : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200 border-slate-200 dark:border-slate-700 hover:bg-slate-200'
              }`}
              title="Activar/Desactivar Alerta Sonora"
            >
              {isMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4 text-emerald-500 dark:text-emerald-400 animate-bounce" />}
              <span className="hidden sm:inline">{isMuted ? 'Mute' : 'Sonido'}</span>
            </button>

            <button
              onClick={loadPedidos}
              className="p-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white border border-slate-200 dark:border-slate-700 transition-colors"
              title="Recargar"
            >
              <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            </button>
          </div>

        </div>
      </div>

      {/* VISTA 1: TABLERO KANBAN DE PEDIDOS (INCLUYE DOMICILIOS) */}
      {activeSubTab === 'kanban' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          
          {/* COLUMNA 1: PENDIENTES */}
          <div className="space-y-4">
            <div className="flex items-center justify-between bg-amber-500/10 border border-amber-500/20 px-4 py-3 rounded-xl">
              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4 text-amber-500 dark:text-amber-400" />
                <h2 className="font-extrabold text-sm text-amber-700 dark:text-amber-300">Pendientes</h2>
              </div>
              <span className="font-black text-xs px-2 py-0.5 rounded bg-amber-500/20 text-amber-700 dark:text-amber-300 border border-amber-500/30">
                {pendientes.length}
              </span>
            </div>

            <div className="space-y-3">
              {pendientes.length === 0 ? (
                <div className="py-8 text-center text-slate-400 text-xs bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800">
                  Sin pedidos pendientes
                </div>
              ) : (
                pendientes.map(pedido => (
                  <PedidoCard
                    key={pedido.id}
                    pedido={pedido}
                    formatCurrency={formatCurrency}
                    onNextState={() => handleCambiarEstado(pedido.id, 'en_preparacion')}
                    nextActionLabel="A Preparación"
                    nextActionIcon={ChefHat}
                    actionColor="bg-amber-500 hover:bg-amber-400 text-slate-950"
                  />
                ))
              )}
            </div>
          </div>

          {/* COLUMNA 2: EN PREPARACIÓN */}
          <div className="space-y-4">
            <div className="flex items-center justify-between bg-blue-500/10 border border-blue-500/20 px-4 py-3 rounded-xl">
              <div className="flex items-center gap-2">
                <ChefHat className="w-4 h-4 text-blue-500 dark:text-blue-400" />
                <h2 className="font-extrabold text-sm text-blue-700 dark:text-blue-300">En Preparación</h2>
              </div>
              <span className="font-black text-xs px-2 py-0.5 rounded bg-blue-500/20 text-blue-700 dark:text-blue-300 border border-blue-500/30">
                {enPreparacion.length}
              </span>
            </div>

            <div className="space-y-3">
              {enPreparacion.map(pedido => (
                <PedidoCard
                  key={pedido.id}
                  pedido={pedido}
                  formatCurrency={formatCurrency}
                  onNextState={() => handleCambiarEstado(pedido.id, 'entregado')}
                  nextActionLabel="Marcar Entregado"
                  nextActionIcon={CheckCircle2}
                  actionColor="bg-blue-500 hover:bg-blue-400 text-slate-950"
                />
              ))}
            </div>
          </div>

          {/* COLUMNA 3: ENTREGADOS / LISTOS PARA COBRAR */}
          <div className="space-y-4">
            <div className="flex items-center justify-between bg-emerald-500/10 border border-emerald-500/20 px-4 py-3 rounded-xl">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-500 dark:text-emerald-400" />
                <h2 className="font-extrabold text-sm text-emerald-700 dark:text-emerald-300">Entregados / Cobrar</h2>
              </div>
              <span className="font-black text-xs px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-700 dark:text-emerald-300 border border-emerald-500/30">
                {entregados.length}
              </span>
            </div>

            <div className="space-y-3">
              {entregados.map(pedido => (
                <PedidoCard
                  key={pedido.id}
                  pedido={pedido}
                  formatCurrency={formatCurrency}
                  onNextState={() => setOrderToBill(pedido)}
                  nextActionLabel="Cobrar / Facturar"
                  nextActionIcon={Receipt}
                  actionColor="bg-emerald-500 hover:bg-emerald-400 text-slate-950"
                />
              ))}
            </div>
          </div>

          {/* COLUMNA 4: FACTURADOS / CERRADOS */}
          <div className="space-y-4">
            <div className="flex items-center justify-between bg-slate-200 dark:bg-slate-800 px-4 py-3 rounded-xl">
              <div className="flex items-center gap-2">
                <Receipt className="w-4 h-4 text-slate-500 dark:text-slate-400" />
                <h2 className="font-extrabold text-sm text-slate-700 dark:text-slate-300">Facturados</h2>
              </div>
              <span className="font-black text-xs px-2 py-0.5 rounded bg-slate-300 dark:bg-slate-700 text-slate-700 dark:text-slate-300">
                {facturados.length}
              </span>
            </div>

            <div className="space-y-3">
              {facturados.slice(0, 10).map(pedido => (
                <div
                  key={pedido.id}
                  onClick={() => setOrderToBill(pedido)}
                  className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-4 rounded-xl space-y-2 opacity-75 hover:opacity-100 transition-opacity cursor-pointer shadow-sm"
                >
                  <div className="flex justify-between items-center text-xs">
                    <span className="font-bold text-slate-900 dark:text-slate-200">
                      Mesa #{pedido.mesas?.numero_mesa || pedido.numero_mesa || '?'}
                    </span>
                    <span className="text-[10px] text-emerald-500 font-bold uppercase">Facturado ✓</span>
                  </div>
                  <div className="flex justify-between items-center pt-1 border-t border-slate-100 dark:border-slate-800/80">
                    <span className="text-[10px] text-slate-400 font-mono">Ver Factura 🔍</span>
                    <span className="text-sm font-black text-slate-900 dark:text-slate-200">
                      {formatCurrency(pedido.total)}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>

        </div>
      )}

      {/* VISTA 2: MÓDULO BARRA EXPRESS INTEGRADO EN ADMIN */}
      {activeSubTab === 'barra' && (
        <div className="space-y-6">
          <div className="bg-gradient-to-r from-amber-500/15 via-slate-900 to-slate-900 border border-amber-500/30 rounded-3xl p-6 shadow-xl flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <Beer className="w-5 h-5 text-amber-400" />
                <h2 className="text-lg font-black text-white">Módulo de Pedidos Rápidos en Barra (Bar Tabs)</h2>
              </div>
              <p className="text-xs text-slate-400">Atiende y cobra pedidos directamente en la barra principal sin requerir asignación de mesa física.</p>
            </div>

            <button
              onClick={handleCreateBarTab}
              className="px-5 py-2.5 bg-amber-500 hover:bg-amber-400 text-slate-950 font-extrabold rounded-2xl text-xs flex items-center gap-2 shadow-lg transition-all"
            >
              <Plus className="w-4 h-4" />
              <span>+ Abrir Nuevo Pedido en Barra</span>
            </button>
          </div>

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
                          <span className="font-bold text-amber-400">{formatCurrency(item.qty * item.price)}</span>
                        </div>
                      ))
                    )}
                  </div>

                  <div className="flex justify-between items-center pt-1 text-xs">
                    <div className="text-left">
                      <span className="text-slate-400 font-semibold block">Total Acumulado</span>
                      <span className="text-base font-black text-amber-400">{formatCurrency(totalTab)}</span>
                    </div>

                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleCobrarBarTab(tab);
                      }}
                      className="px-4 py-2 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold rounded-xl text-xs flex items-center gap-1.5 shadow"
                    >
                      <Receipt className="w-3.5 h-3.5" />
                      <span>Cobrar / Facturar</span>
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* MODAL DE FACTURACIÓN Y COMPROBANTE DE COBRO */}
      {orderToBill && (
        <FacturaModal
          pedido={orderToBill}
          onClose={() => setOrderToBill(null)}
          onFacturado={(pedidoId) => {
            handleOrderFacturado(pedidoId);
            setOrderToBill(null);
          }}
        />
      )}

    </div>
  );
}

// COMPONENTE TARJETA DE PEDIDO REUTILIZABLE
function PedidoCard({ pedido, formatCurrency, onNextState, nextActionLabel, nextActionIcon: ActionIcon, actionColor }) {
  const mesaNum = pedido.mesas?.numero_mesa || pedido.numero_mesa || '?';
  const detalles = pedido.detalle_pedido || pedido.detalles || pedido.items || [];
  
  const notesText = pedido.notas || '';
  const isDelivery = pedido.tipo_pedido === 'delivery' || mesaNum === 'DELIVERY' || mesaNum === 'DOMICILIO' || notesText.includes('[🛵 DOMICILIO]');
  const isTakeaway = pedido.tipo_pedido === 'takeaway' || mesaNum === 'TAKEAWAY' || mesaNum === 'PARA LLEVAR' || notesText.includes('[🛍️ PARA LLEVAR]');

  // Extraer datos del cliente si vienen formateados en las notas
  let clientName = pedido.cliente_nombre || '';
  let clientPhone = pedido.cliente_telefono || '';
  let clientAddress = pedido.cliente_direccion || '';

  if (!clientName && notesText.includes('Cliente:')) {
    const matchName = notesText.match(/Cliente:\s*([^|]+)/);
    if (matchName) clientName = matchName[1].trim();
  }
  if (!clientPhone && notesText.includes('Tel:')) {
    const matchTel = notesText.match(/Tel:\s*([^|]+)/);
    if (matchTel) clientPhone = matchTel[1].trim();
  }
  if (!clientAddress && notesText.includes('Dir:')) {
    const matchDir = notesText.match(/Dir:\s*([^|]+)/);
    if (matchDir) clientAddress = matchDir[1].trim();
  }

  return (
    <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 p-4 rounded-xl space-y-3 transition-all shadow-sm">
      <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800/80 pb-2">
        <div>
          {isDelivery ? (
            <span className="font-black text-xs px-2.5 py-0.5 rounded-full bg-blue-500/20 text-blue-600 dark:text-blue-400 border border-blue-500/30 uppercase">
              🛵 Domicilio
            </span>
          ) : isTakeaway ? (
            <span className="font-black text-xs px-2.5 py-0.5 rounded-full bg-amber-500/20 text-amber-600 dark:text-amber-400 border border-amber-500/30 uppercase">
              🛍️ Para Llevar
            </span>
          ) : (
            <span className="font-black text-base text-slate-900 dark:text-white">Mesa #{mesaNum}</span>
          )}
        </div>
        <span className="text-[10px] text-slate-400 dark:text-slate-500 font-medium">
          {new Date(pedido.created_at || Date.now()).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
        </span>
      </div>

      {/* Datos del cliente si es Delivery / Takeaway */}
      {(isDelivery || isTakeaway || clientName) && (
        <div className="bg-slate-50 dark:bg-slate-950 p-2.5 rounded-xl border border-slate-200 dark:border-slate-800/80 text-xs space-y-1">
          <p className="font-bold text-slate-900 dark:text-slate-200">👤 {clientName || 'Cliente Domicilio'}</p>
          {clientPhone && (
            <p className="text-slate-500 dark:text-slate-400 text-[11px] font-semibold flex items-center justify-between">
              <span>📞 {clientPhone}</span>
              <a href={`https://wa.me/${clientPhone.replace(/\D/g, '')}`} target="_blank" rel="noreferrer" className="text-emerald-500 hover:underline text-[10px]">WhatsApp 💬</a>
            </p>
          )}
          {isDelivery && clientAddress && (
            <p className="text-blue-600 dark:text-blue-400 text-[11px] font-bold pt-0.5">📍 {clientAddress}</p>
          )}
        </div>
      )}

      {detalles.length > 0 ? (
        <div className="space-y-1.5 text-xs text-slate-700 dark:text-slate-300">
          {detalles.map((d, idx) => (
            <div key={idx} className="flex justify-between items-center">
              <span className="truncate pr-2 font-medium">
                {d.cantidad}x {d.productos?.nombre || d.producto?.nombre || d.nombre || 'Producto'} ({d.tamano || 'unidad'})
              </span>
              <span className="font-bold text-slate-500 dark:text-slate-400">{formatCurrency((d.precio_unitario || d.precio || 0) * d.cantidad)}</span>
            </div>
          ))}
        </div>
      ) : (
        <p className="text-xs text-slate-400 italic">Sin detalle especificado</p>
      )}

      {notesText && (
        <p className="text-[11px] bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 p-2 rounded-lg text-amber-600 dark:text-amber-300/90 font-mono line-clamp-2">
          {notesText}
        </p>
      )}

      <div className="pt-2 border-t border-slate-100 dark:border-slate-800/80 flex items-center justify-between">
        <div className="text-xs">
          <span className="text-[10px] text-slate-400 dark:text-slate-500 block">Total</span>
          <span className="font-black text-emerald-600 dark:text-emerald-400 text-sm">{formatCurrency(pedido.total)}</span>
        </div>

        <button
          onClick={onNextState}
          className={`px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5 transition-colors ${actionColor}`}
        >
          <ActionIcon className="w-3.5 h-3.5" />
          <span>{nextActionLabel}</span>
        </button>
      </div>
    </div>
  );
}

export default CajaView;
