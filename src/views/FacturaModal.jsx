import React, { useState } from 'react';
import { Receipt, Printer, CheckCircle, CreditCard, DollarSign, Smartphone, X } from 'lucide-react';
import { apiService } from '../services/api';
import { useAuth } from '../context/AuthContext';

export function FacturaModal({ pedido, order, onClose, onFacturado, onOrderFacturado }) {
  const { negocio, formatCurrency } = useAuth();
  const activeOrder = pedido || order;
  const handleFacturadoCallback = onFacturado || onOrderFacturado;

  const [metodoPago, setMetodoPago] = useState('efectivo');
  const [propinaPct, setPropinaPct] = useState(10);
  const [isProcessing, setIsProcessing] = useState(false);

  if (!activeOrder) return null;

  const subtotal = Number(activeOrder.total) || 0;
  const propina = (subtotal * propinaPct) / 100;
  const totalConPropina = subtotal + propina;

  const handleCerrarYFacturar = async () => {
    try {
      setIsProcessing(true);
      await apiService.actualizarEstadoPedido(activeOrder.id, 'facturado', metodoPago);
      if (handleFacturadoCallback) {
        handleFacturadoCallback(activeOrder.id);
      }
      onClose();
    } catch (err) {
      console.error('Error al facturar pedido:', err);
      alert('Error al cerrar la cuenta. Por favor reintenta.');
    } finally {
      setIsProcessing(false);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md">
      <div className="w-full max-w-lg bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-2xl flex flex-col max-h-[90vh]">
        
        {/* Header de la Factura */}
        <div className="p-5 border-b border-slate-800 flex items-center justify-between bg-slate-950">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-500/10 text-emerald-400 flex items-center justify-center border border-emerald-500/20">
              <Receipt className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-extrabold text-white text-base">Comprobante de Cobro</h3>
              <p className="text-xs text-slate-400">
                {negocio?.nombre || 'GST Resto Bar'} &bull; Mesa #{activeOrder.mesas?.numero_mesa || activeOrder.numero_mesa || '?'}
              </p>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Cuerpo de la Factura */}
        <div className="p-6 overflow-y-auto space-y-6">
          
          {/* Encabezado Comercial Tenant */}
          <div className="text-center pb-3 border-b border-slate-800">
            <h2 className="font-extrabold text-lg text-white">{negocio?.nombre || 'GST Resto Bar'}</h2>
            <p className="text-xs text-slate-400">NIT: {negocio?.nit || '901.234.567-8'}</p>
            <p className="text-[11px] text-emerald-400 font-mono mt-1">Ticket #: {activeOrder.id?.slice(0, 8)}</p>
          </div>

          {/* Desglose de Productos */}
          <div>
            <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">Detalle del Consumo</h4>
            <div className="space-y-2">
              {(activeOrder.detalle_pedido || activeOrder.detalles || []).map((det, idx) => {
                const prodNombre = det.productos?.nombre || det.producto?.nombre || 'Bebida';
                const tamano = det.tamano || '12oz';
                const cant = det.cantidad || 1;
                const pUnit = det.precio_unitario || 0;
                const sub = det.subtotal || (cant * pUnit);

                return (
                  <div key={idx} className="flex items-center justify-between py-2 border-b border-slate-800/60 text-xs">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-emerald-400 w-5">{cant}x</span>
                      <div>
                        <span className="text-slate-200 font-bold block">{prodNombre}</span>
                        <span className="text-[10px] text-slate-400 font-semibold uppercase">{tamano}</span>
                      </div>
                    </div>
                    <span className="font-bold text-slate-200">{formatCurrency(sub)}</span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Selector de Propina */}
          <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-300">Propina Sugerida:</span>
              <div className="flex gap-2">
                {[0, 5, 10, 15].map(pct => (
                  <button
                    key={pct}
                    onClick={() => setPropinaPct(pct)}
                    className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all border ${
                      propinaPct === pct
                        ? 'bg-emerald-500 text-slate-950 border-emerald-400 font-black'
                        : 'bg-slate-900 text-slate-400 border-slate-800 hover:text-white'
                    }`}
                  >
                    {pct}%
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Totales */}
          <div className="space-y-2 pt-2 border-t border-slate-800 text-xs">
            <div className="flex justify-between text-slate-400">
              <span>Subtotal</span>
              <span>{formatCurrency(subtotal)}</span>
            </div>
            <div className="flex justify-between text-slate-400">
              <span>Propina ({propinaPct}%)</span>
              <span>{formatCurrency(propina)}</span>
            </div>
            <div className="flex justify-between text-base font-extrabold text-white pt-2 border-t border-slate-800">
              <span>Total a Cobrar</span>
              <span className="text-emerald-400">{formatCurrency(totalConPropina)}</span>
            </div>
          </div>

          {/* Métodos de Pago */}
          <div>
            <label className="block text-xs font-bold text-slate-300 mb-2">Método de Pago:</label>
            <div className="grid grid-cols-2 gap-2">
              {[
                { id: 'efectivo', label: 'Efectivo', icon: DollarSign },
                { id: 'nequi', label: 'Nequi', icon: Smartphone },
                { id: 'daviplata', label: 'Daviplata', icon: Smartphone },
                { id: 'tarjeta', label: 'Tarjeta', icon: CreditCard }
              ].map(m => {
                const Icon = m.icon;
                const active = metodoPago === m.id;
                return (
                  <button
                    key={m.id}
                    onClick={() => setMetodoPago(m.id)}
                    className={`p-3 rounded-xl border flex items-center gap-2.5 text-xs font-bold transition-all ${
                      active
                        ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/40'
                        : 'bg-slate-950 text-slate-400 border-slate-800 hover:text-white'
                    }`}
                  >
                    <Icon className="w-4 h-4" />
                    <span>{m.label}</span>
                  </button>
                );
              })}
            </div>
          </div>

        </div>

        {/* Acciones Modal */}
        <div className="p-5 bg-slate-950 border-t border-slate-800 flex items-center justify-between gap-3">
          <button
            onClick={handlePrint}
            className="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold flex items-center gap-2 transition-colors border border-slate-700"
          >
            <Printer className="w-4 h-4" />
            <span>Imprimir Ticket</span>
          </button>

          <button
            onClick={handleCerrarYFacturar}
            disabled={isProcessing}
            className="px-5 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black text-xs transition-colors flex items-center gap-2 shadow-md shadow-emerald-500/20 disabled:opacity-50"
          >
            <CheckCircle className="w-4 h-4" />
            <span>{isProcessing ? 'Facturando...' : 'Confirmar Cobro'}</span>
          </button>
        </div>

      </div>
    </div>
  );
}
