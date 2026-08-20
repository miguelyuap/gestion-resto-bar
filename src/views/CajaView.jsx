import React, { useState, useEffect } from 'react';
import { 
  Volume2, VolumeX, BellRing, Clock, ChefHat, CheckCircle2, 
  Receipt, Sparkles, Filter, Search, ArrowRight, RefreshCw
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
      
      {/* HEADER DASHBOARD DE CAJA Y COCINA */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6 bg-slate-900 border border-slate-800 p-6 rounded-2xl">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-emerald-500 text-slate-950 flex items-center justify-center font-black text-xl shrink-0 shadow-sm">
            🖥️
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl sm:text-2xl font-extrabold text-white">Dashboard de Caja & Cocina</h1>
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            </div>
            <p className="text-xs text-slate-400 mt-0.5">
              {negocio?.nombre || 'GST Resto Bar'} &bull; Control en Tiempo Real vía Supabase Realtime
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 bg-slate-950 border border-slate-800 px-3 py-1.5 rounded-xl text-xs">
            <Filter className="w-3.5 h-3.5 text-slate-400" />
            <select
              value={filtroMesa}
              onChange={(e) => setFiltroMesa(e.target.value)}
              className="bg-transparent text-white font-bold outline-none text-xs"
            >
              <option value="" className="bg-slate-900 text-white">Todas las Mesas</option>
              {Array.from({ length: 10 }, (_, i) => i + 1).map(n => (
                <option key={n} value={n} className="bg-slate-900 text-white">Mesa #{n}</option>
              ))}
            </select>
          </div>

          <button
            onClick={handleToggleMute}
            className={`p-2.5 rounded-xl border text-xs font-bold transition-all flex items-center gap-2 ${
              isMuted
                ? 'bg-rose-950/40 text-rose-400 border-rose-900/60'
                : 'bg-slate-800 text-slate-200 border-slate-700 hover:bg-slate-700'
            }`}
            title="Activar/Desactivar Alerta Sonora"
          >
            {isMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4 text-emerald-400 animate-bounce" />}
            <span className="hidden sm:inline">{isMuted ? 'Mute' : 'Sonido'}</span>
          </button>

          <button
            onClick={loadPedidos}
            className="p-2.5 rounded-xl bg-slate-800 text-slate-300 hover:text-white border border-slate-700 transition-colors"
            title="Recargar"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </div>

      {/* TARJETAS KANBAN DE ESTADOS (4 COLUMNAS) */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        
        {/* COLUMNA 1: PENDIENTES (NUEVOS ENTRANTES) */}
        <div className="space-y-4">
          <div className="flex items-center justify-between bg-amber-500/10 border border-amber-500/20 px-4 py-3 rounded-xl">
            <div className="flex items-center gap-2">
              <Clock className="w-4 h-4 text-amber-400" />
              <h2 className="font-extrabold text-sm text-amber-300">Pendientes</h2>
            </div>
            <span className="font-black text-xs px-2 py-0.5 rounded bg-amber-500/20 text-amber-300 border border-amber-500/30">
              {pendientes.length}
            </span>
          </div>

          <div className="space-y-3">
            {pendientes.map(pedido => (
              <PedidoCard
                key={pedido.id}
                pedido={pedido}
                formatCurrency={formatCurrency}
                onNextState={() => handleCambiarEstado(pedido.id, 'en_preparacion')}
                nextActionLabel="A Preparación"
                nextActionIcon={ChefHat}
                actionColor="bg-amber-500 hover:bg-amber-400 text-slate-950"
              />
            ))}
          </div>
        </div>

        {/* COLUMNA 2: EN PREPARACIÓN */}
        <div className="space-y-4">
          <div className="flex items-center justify-between bg-blue-500/10 border border-blue-500/20 px-4 py-3 rounded-xl">
            <div className="flex items-center gap-2">
              <ChefHat className="w-4 h-4 text-blue-400" />
              <h2 className="font-extrabold text-sm text-blue-300">En Preparación</h2>
            </div>
            <span className="font-black text-xs px-2 py-0.5 rounded bg-blue-500/20 text-blue-300 border border-blue-500/30">
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

        {/* COLUMNA 3: ENTREGADOS (LISTOS PARA FACTURAR) */}
        <div className="space-y-4">
          <div className="flex items-center justify-between bg-purple-500/10 border border-purple-500/20 px-4 py-3 rounded-xl">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-purple-400" />
              <h2 className="font-extrabold text-sm text-purple-300">Entregados</h2>
            </div>
            <span className="font-black text-xs px-2 py-0.5 rounded bg-purple-500/20 text-purple-300 border border-purple-500/30">
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
                actionColor="bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black shadow-md shadow-emerald-500/20"
              />
            ))}
          </div>
        </div>

        {/* COLUMNA 4: FACTURADOS (HISTORIAL) */}
        <div className="space-y-4">
          <div className="flex items-center justify-between bg-slate-900 border border-slate-800 px-4 py-3 rounded-xl">
            <div className="flex items-center gap-2">
              <Receipt className="w-4 h-4 text-slate-400" />
              <h2 className="font-extrabold text-sm text-slate-300">Facturados</h2>
            </div>
            <span className="font-black text-xs px-2 py-0.5 rounded bg-slate-800 text-slate-400">
              {facturados.length}
            </span>
          </div>

          <div className="space-y-3 max-h-[600px] overflow-y-auto pr-1">
            {facturados.map(pedido => (
              <div key={pedido.id} className="bg-slate-950 border border-slate-800 p-4 rounded-xl opacity-75">
                <div className="flex justify-between items-center text-xs mb-1">
                  <span className="font-black text-slate-300">Mesa #{pedido.mesas?.numero_mesa || pedido.numero_mesa || '?'}</span>
                  <span className="text-[10px] uppercase font-bold text-emerald-400">{pedido.metodo_pago || 'Pago'}</span>
                </div>
                <div className="text-right text-sm font-black text-slate-200">
                  {formatCurrency(pedido.total)}
                </div>
              </div>
            ))}
          </div>
        </div>

      </div>

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
  const detalles = pedido.detalle_pedido || pedido.detalles || [];

  return (
    <div className="bg-slate-900 border border-slate-800 hover:border-slate-700 p-4 rounded-xl space-y-3 transition-all">
      <div className="flex items-center justify-between border-b border-slate-800/80 pb-2">
        <span className="font-black text-base text-white">Mesa #{mesaNum}</span>
        <span className="text-[10px] text-slate-500 font-medium">
          {new Date(pedido.created_at || Date.now()).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
        </span>
      </div>

      {detalles.length > 0 ? (
        <div className="space-y-1.5 text-xs text-slate-300">
          {detalles.map((d, idx) => (
            <div key={idx} className="flex justify-between items-center">
              <span className="truncate pr-2 font-medium">
                {d.cantidad}x {d.productos?.nombre || d.producto?.nombre || 'Bebida'} ({d.tamano})
              </span>
              <span className="font-bold text-slate-400">{formatCurrency(d.precio_unitario * d.cantidad)}</span>
            </div>
          ))}
        </div>
      ) : (
        <p className="text-xs text-slate-500 italic">Sin detalle especificado</p>
      )}

      {pedido.notas && (
        <p className="text-[11px] bg-slate-950 border border-slate-800 p-2 rounded-lg text-amber-300/90 font-mono line-clamp-2">
          {pedido.notas}
        </p>
      )}

      <div className="pt-2 border-t border-slate-800/80 flex items-center justify-between">
        <div className="text-xs">
          <span className="text-[10px] text-slate-500 block">Total</span>
          <span className="font-black text-emerald-400 text-sm">{formatCurrency(pedido.total)}</span>
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
