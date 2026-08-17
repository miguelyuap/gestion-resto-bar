import React, { useState } from 'react';
import { Receipt, Printer, CheckCircle, CreditCard, DollarSign, Smartphone, X } from 'lucide-react';
import { apiService } from '../services/api';

export function FacturaModal({ order, onClose, onOrderFacturado }) {
  const [metodoPago, setMetodoPago] = useState('efectivo');
  const [propinaPct, setPropinaPct] = useState(10);
  const [isProcessing, setIsProcessing] = useState(false);

  if (!order) return null;

  const formatCOP = (val) => {
    return new Intl.NumberFormat('es-CO', {
      style: 'currency',
      currency: 'COP',
      maximumFractionDigits: 0
    }).format(val || 0);
  };

  const subtotal = order.total || 0;
  const propina = (subtotal * propinaPct) / 100;
  const totalConPropina = subtotal + propina;

  const handleCerrarYFacturar = async () => {
    try {
      setIsProcessing(true);
      await apiService.actualizarEstadoPedido(order.id, 'facturado', metodoPago);
      if (onOrderFacturado) {
        onOrderFacturado(order.id);
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
      <div className="w-full max-w-lg bg-[#0b0f19] border border-slate-800 rounded-3xl overflow-hidden shadow-2xl flex flex-col max-h-[90vh]">
        
        {/* Header de la Factura */}
        <div className="p-5 border-b border-slate-800 flex items-center justify-between bg-slate-900/50">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-cyan-500/20 text-cyan-400 flex items-center justify-center border border-cyan-500/30">
              <Receipt className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-extrabold text-white text-base">Facturación & Ticket</h3>
              <p className="text-xs text-slate-400">
                Mesa #{order.mesas?.numero_mesa || order.numero_mesa || '?'} &bull; Pedido #{order.id?.slice(0, 8)}
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

        {/* Cuerpo de la Factura (Navegador) */}
        <div className="p-6 overflow-y-auto space-y-6">
          
          {/* Desglose de Productos */}
          <div>
            <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">Detalle del Consumo (Granizados & Flow)</h4>
            <div className="space-y-2">
              {(order.detalle_pedido || order.detalles || []).map((det, idx) => {
                const prodNombre = det.productos?.nombre || det.producto?.nombre || 'Granizado';
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
                    <span className="font-bold text-slate-200">{formatCOP(sub)}</span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Selector de Propina */}
          <div className="p-4 rounded-2xl bg-slate-900/60 border border-slate-800">
            <label className="block text-xs font-bold text-slate-300 mb-2">Propina / Servicio Voluntario:</label>
            <div className="grid grid-cols-3 gap-2">
              {[0, 10, 15].map(pct => (
                <button
                  key={pct}
                  onClick={() => setPropinaPct(pct)}
                  className={`py-2 rounded-xl text-xs font-bold transition-all border ${
                    propinaPct === pct
                      ? 'bg-cyan-500/20 text-cyan-300 border-cyan-500'
                      : 'bg-slate-950 text-slate-400 border-slate-800 hover:border-slate-700'
                  }`}
                >
                  {pct === 0 ? 'Sin Propina' : `${pct}% (${formatCOP((subtotal * pct)/100)})`}
                </button>
              ))}
            </div>
          </div>

          {/* Método de Pago */}
          <div>
            <label className="block text-xs font-bold text-slate-300 mb-2">Método de Pago:</label>
            <div className="grid grid-cols-3 gap-2">
              <button
                onClick={() => setMetodoPago('efectivo')}
                className={`flex items-center justify-center gap-2 p-3 rounded-2xl border text-xs font-bold transition-all ${
                  metodoPago === 'efectivo'
                    ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500'
                    : 'bg-slate-900 text-slate-400 border-slate-800'
                }`}
              >
                <DollarSign className="w-4 h-4" />
                <span>Efectivo</span>
              </button>

              <button
                onClick={() => setMetodoPago('nequi')}
                className={`flex items-center justify-center gap-2 p-3 rounded-2xl border text-xs font-bold transition-all ${
                  metodoPago === 'nequi'
                    ? 'bg-purple-500/20 text-purple-300 border-purple-500'
                    : 'bg-slate-900 text-slate-400 border-slate-800'
                }`}
              >
                <Smartphone className="w-4 h-4" />
                <span>Nequi / Davi</span>
              </button>

              <button
                onClick={() => setMetodoPago('tarjeta')}
                className={`flex items-center justify-center gap-2 p-3 rounded-2xl border text-xs font-bold transition-all ${
                  metodoPago === 'tarjeta'
                    ? 'bg-cyan-500/20 text-cyan-300 border-cyan-500'
                    : 'bg-slate-900 text-slate-400 border-slate-800'
                }`}
              >
                <CreditCard className="w-4 h-4" />
                <span>Tarjeta</span>
              </button>
            </div>
          </div>

          {/* Totales */}
          <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 space-y-2">
            <div className="flex justify-between text-xs text-slate-400">
              <span>Subtotal Consumo:</span>
              <span className="font-semibold text-slate-200">{formatCOP(subtotal)}</span>
            </div>
            {propina > 0 && (
              <div className="flex justify-between text-xs text-slate-400">
                <span>Propina ({propinaPct}%):</span>
                <span className="font-semibold text-cyan-400">{formatCOP(propina)}</span>
              </div>
            )}
            <div className="flex justify-between text-base font-extrabold text-white pt-2 border-t border-slate-800">
              <span>TOTAL A COBRAR:</span>
              <span className="text-emerald-400">{formatCOP(totalConPropina)}</span>
            </div>
          </div>

        </div>

        {/* Acciones de Facturación */}
        <div className="p-5 border-t border-slate-800 bg-slate-900/50 flex items-center justify-between gap-3">
          <button
            onClick={handlePrint}
            className="flex-1 py-3 bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold rounded-2xl text-xs flex items-center justify-center gap-2 transition-all border border-slate-700"
          >
            <Printer className="w-4 h-4" />
            <span>Imprimir Ticket</span>
          </button>

          <button
            onClick={handleCerrarYFacturar}
            disabled={isProcessing}
            className="flex-1 py-3 bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-slate-950 font-extrabold rounded-2xl text-xs flex items-center justify-center gap-2 transition-all shadow-lg shadow-emerald-500/20 disabled:opacity-50"
          >
            <CheckCircle className="w-4 h-4" />
            <span>Cerrar y Facturar</span>
          </button>
        </div>

      </div>

      {/* PLANTILLA DE IMPRESIÓN OCULTA DE TICKET TÉRMICO (80mm POS) */}
      <div id="printable-ticket" className="hidden">
        <div style={{ textAlign: 'center', marginBottom: '10px' }}>
          <h2 style={{ fontSize: '16px', fontWeight: 'bold', margin: '0' }}>GRANIZADOS & FLOW</h2>
          <p style={{ margin: '2px 0', fontWeight: 'bold' }}>A lo Más Agogo Granizados</p>
          <p style={{ margin: '2px 0' }}>NIT: 901.884.221-0</p>
          <p style={{ margin: '5px 0' }}>--------------------------------</p>
        </div>

        <p><strong>Mesa:</strong> #{order.mesas?.numero_mesa || order.numero_mesa || '?'}</p>
        <p><strong>Pedido:</strong> {order.id?.slice(0, 8)}</p>
        <p><strong>Fecha:</strong> {new Date().toLocaleString('es-CO')}</p>
        <p>--------------------------------</p>

        <table style={{ width: '100%', fontSize: '11px', textAlign: 'left' }}>
          <thead>
            <tr>
              <th>Cant</th>
              <th>Prod</th>
              <th style={{ textAlign: 'right' }}>Total</th>
            </tr>
          </thead>
          <tbody>
            {(order.detalle_pedido || order.detalles || []).map((det, i) => {
              const pNom = det.productos?.nombre || det.producto?.nombre || 'Producto';
              const cant = det.cantidad || 1;
              const sub = det.subtotal || (cant * (det.precio_unitario || 0));
              return (
                <tr key={i}>
                  <td>{cant}x</td>
                  <td>{pNom.slice(0, 18)}</td>
                  <td style={{ textAlign: 'right' }}>${sub.toLocaleString('es-CO')}</td>
                </tr>
              );
            })}
          </tbody>
        </table>

        <p>--------------------------------</p>
        <p style={{ display: 'flex', justifyContent: 'space-between' }}>
          <span>Subtotal:</span>
          <span>${subtotal.toLocaleString('es-CO')}</span>
        </p>
        {propina > 0 && (
          <p style={{ display: 'flex', justifyContent: 'space-between' }}>
            <span>Propina ({propinaPct}%):</span>
            <span>${propina.toLocaleString('es-CO')}</span>
          </p>
        )}
        <p style={{ display: 'flex', justifyContent: 'space-between', fontSize: '14px', fontWeight: 'bold' }}>
          <span>TOTAL:</span>
          <span>${totalConPropina.toLocaleString('es-CO')}</span>
        </p>
        <p style={{ marginTop: '5px' }}><strong>Método de Pago:</strong> {metodoPago.toUpperCase()}</p>
        
        <div style={{ textAlign: 'center', marginTop: '15px' }}>
          <p>¡Gracias por tu visita!</p>
          <p>Disfruta tus granizados 🍹</p>
        </div>
      </div>

    </div>
  );
}
