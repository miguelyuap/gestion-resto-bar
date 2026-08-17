import React, { useState, useEffect } from 'react';
import { 
  Volume2, VolumeX, BellRing, Clock, ChefHat, CheckCircle2, 
  Receipt, Sparkles, Filter, Search, ArrowRight, RefreshCw
} from 'lucide-react';
import { apiService } from '../services/api';
import { audioAlert } from '../utils/audioAlert';
import { FacturaModal } from './FacturaModal';

export function CajaView() {
  const [pedidos, setPedidos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isMuted, setIsMuted] = useState(false);
  const [filtroMesa, setFiltroMesa] = useState('');
  
  // Estado para Modal de Facturación
  const [orderToBill, setOrderToBill] = useState(null);

  // Cargar Pedidos Iniciales
  const loadPedidos = async () => {
    try {
      setLoading(true);
      const data = await apiService.getPedidos();
      setPedidos(data);
    } catch (err) {
      console.error('Error al cargar pedidos en caja:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadPedidos();

    // Suscripción Realtime WebSockets vía Supabase
    const unsubscribe = apiService.subscribeToPedidos(
      (newOrder) => {
        // Reproducir alerta sonora de caja
        audioAlert.playNewOrderSound();
        // Agregar pedido recibido a la lista en vivo
        setPedidos(prev => [newOrder, ...prev]);
      },
      (updatedOrder) => {
        setPedidos(prev =>
          prev.map(p => (p.id === updatedOrder.id ? { ...p, ...updatedOrder } : p))
        );
      }
    );

    return () => {
      if (unsubscribe) unsubscribe();
    };
  }, []);

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

  const formatCOP = (val) => {
    return new Intl.NumberFormat('es-CO', {
      style: 'currency',
      currency: 'COP',
      maximumFractionDigits: 0
    }).format(val || 0);
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
      
      {/* Header del Dashboard de Caja */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8 bg-slate-900/80 border border-slate-800 p-6 rounded-3xl backdrop-blur-md">
        
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-pink-500 to-rose-500 text-white flex items-center justify-center shadow-lg shadow-pink-500/20 shrink-0">
            <BellRing className="w-6 h-6 animate-pulse" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-2xl font-extrabold text-white">Dashboard de Caja & Cocina</h1>
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-ping" />
              <span className="text-xs font-bold text-emerald-400">WebSockets Realtime</span>
            </div>
            <p className="text-xs text-slate-400 mt-0.5">
              Escuchando pedidos entrantes en tiempo real.
            </p>
          </div>
        </div>

        {/* Botones de Control & Sonido */}
        <div className="flex items-center gap-3">
          <button
            onClick={handleToggleMute}
            className={`px-4 py-2.5 rounded-2xl text-xs font-bold flex items-center gap-2 transition-all border ${
              isMuted
                ? 'bg-rose-500/10 text-rose-400 border-rose-500/30'
                : 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30 glow-emerald'
            }`}
          >
            {isMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
            <span>{isMuted ? 'Alerta Silenciada' : 'Alerta Sonora Activa'}</span>
          </button>

          <button
            onClick={loadPedidos}
            className="p-2.5 rounded-2xl bg-slate-800 text-slate-300 hover:text-white border border-slate-700 transition-colors"
            title="Refrescar"
          >
            <RefreshCw className="w-4 h-4" />
          </button>

          {/* Filtro por Mesa */}
          <div className="relative">
            <select
              value={filtroMesa}
              onChange={(e) => setFiltroMesa(e.target.value)}
              className="bg-slate-950 text-white text-xs font-bold px-3 py-2.5 rounded-2xl border border-slate-800 outline-none"
            >
              <option value="">Todas las Mesas</option>
              {Array.from({ length: 10 }, (_, i) => i + 1).map(num => (
                <option key={num} value={num}>Mesa #{num}</option>
              ))}
            </select>
          </div>
        </div>

      </div>

      {/* Tablero Kanban de Pedidos */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="h-96 rounded-3xl bg-slate-900/40 animate-pulse border border-slate-800" />
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          
          {/* Columna 1: PENDIENTES */}
          <ColumnKanban
            titulo="⏳ Pendientes"
            badgeColor="bg-amber-500/20 text-amber-300 border-amber-500/40"
            pedidos={pendientes}
            formatCOP={formatCOP}
            renderActions={(pedido) => (
              <button
                onClick={() => handleCambiarEstado(pedido.id, 'en_preparacion')}
                className="w-full py-2 bg-gradient-to-r from-cyan-500 to-teal-500 text-slate-950 font-bold rounded-xl text-xs flex items-center justify-center gap-1.5 transition-all shadow-md shadow-cyan-500/10 active:scale-95"
              >
                <ChefHat className="w-3.5 h-3.5" />
                <span>Pasar a Preparación</span>
              </button>
            )}
            isNewAlert
          />

          {/* Columna 2: EN PREPARACIÓN */}
          <ColumnKanban
            titulo="🍹 En Preparación"
            badgeColor="bg-cyan-500/20 text-cyan-300 border-cyan-500/40"
            pedidos={enPreparacion}
            formatCOP={formatCOP}
            renderActions={(pedido) => (
              <button
                onClick={() => handleCambiarEstado(pedido.id, 'entregado')}
                className="w-full py-2 bg-gradient-to-r from-emerald-500 to-teal-500 text-slate-950 font-bold rounded-xl text-xs flex items-center justify-center gap-1.5 transition-all shadow-md shadow-emerald-500/10 active:scale-95"
              >
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>Marcar Entregado</span>
              </button>
            )}
          />

          {/* Columna 3: ENTREGADOS */}
          <ColumnKanban
            titulo="✅ Entregados"
            badgeColor="bg-emerald-500/20 text-emerald-300 border-emerald-500/40"
            pedidos={entregados}
            formatCOP={formatCOP}
            renderActions={(pedido) => (
              <button
                onClick={() => setOrderToBill(pedido)}
                className="w-full py-2 bg-gradient-to-r from-pink-500 to-rose-500 text-white font-bold rounded-xl text-xs flex items-center justify-center gap-1.5 transition-all shadow-md shadow-pink-500/10 active:scale-95"
              >
                <Receipt className="w-3.5 h-3.5" />
                <span>Cobrar / Facturar</span>
              </button>
            )}
          />

          {/* Columna 4: FACTURADOS */}
          <ColumnKanban
            titulo="💳 Facturados"
            badgeColor="bg-slate-800 text-slate-400 border-slate-700"
            pedidos={facturados}
            formatCOP={formatCOP}
            isHistorical
          />

        </div>
      )}

      {/* Modal de Facturación */}
      {orderToBill && (
        <FacturaModal
          order={orderToBill}
          onClose={() => setOrderToBill(null)}
          onOrderFacturado={handleOrderFacturado}
        />
      )}

    </div>
  );
}

// Componente Interno Columna Kanban
function ColumnKanban({ titulo, badgeColor, pedidos, formatCOP, renderActions, isNewAlert, isHistorical }) {
  return (
    <div className="bg-slate-900/60 border border-slate-800 rounded-3xl p-4 flex flex-col min-h-[500px]">
      
      {/* Header Columna */}
      <div className="flex items-center justify-between pb-3 mb-4 border-b border-slate-800">
        <h2 className="font-extrabold text-sm text-white">{titulo}</h2>
        <span className={`px-2.5 py-0.5 rounded-full text-xs font-bold border ${badgeColor}`}>
          {pedidos.length}
        </span>
      </div>

      {/* Tarjetas de Pedidos */}
      <div className="space-y-4 flex-1">
        {pedidos.length === 0 ? (
          <div className="text-center py-10 text-slate-600 text-xs font-medium">
            Sin pedidos en esta sección
          </div>
        ) : (
          pedidos.map(p => (
            <div 
              key={p.id}
              className={`p-4 rounded-2xl border transition-all ${
                isNewAlert && p.estado === 'pendiente'
                  ? 'bg-slate-900 border-amber-500/60 shadow-lg glow-cyan new-order-pulse'
                  : isHistorical
                  ? 'bg-slate-950/40 border-slate-800/60 opacity-75'
                  : 'bg-slate-900 border-slate-800 hover:border-slate-700'
              }`}
            >
              {/* Header Card */}
              <div className="flex items-center justify-between mb-2">
                <span className="px-2.5 py-1 rounded-xl bg-pink-500/20 text-pink-300 font-extrabold text-xs border border-pink-500/30">
                  Mesa #{p.mesas?.numero_mesa || p.numero_mesa || '?'}
                </span>
                <span className="text-[11px] text-slate-400 font-mono">
                  {new Date(p.created_at).toLocaleTimeString('es-CO', { hour: '2-digit', minute: '2-digit' })}
                </span>
              </div>

              {/* Lista de Ítems */}
              <div className="my-3 space-y-1.5 text-xs">
                {(p.detalle_pedido || p.detalles || []).map((det, idx) => (
                  <div key={idx} className="flex items-center justify-between text-slate-300">
                    <span>
                      <strong className="text-cyan-400 mr-1.5">{det.cantidad}x</strong>
                      {det.productos?.nombre || det.producto?.nombre || 'Producto'}
                    </span>
                  </div>
                ))}
              </div>

              {/* Notas del Pedido si existen */}
              {p.notas && (
                <div className="mb-3 p-2 rounded-xl bg-amber-500/10 border border-amber-500/20 text-[11px] text-amber-300">
                  💬 <em>"{p.notas}"</em>
                </div>
              )}

              {/* Footer Card */}
              <div className="pt-2 border-t border-slate-800/80 flex items-center justify-between">
                <div>
                  <span className="text-[10px] text-slate-400 block">Total</span>
                  <span className="text-sm font-extrabold text-white">{formatCOP(p.total)}</span>
                </div>

                {renderActions && (
                  <div className="w-1/2">
                    {renderActions(p)}
                  </div>
                )}
              </div>

            </div>
          ))
        )}
      </div>

    </div>
  );
}
