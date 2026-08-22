import React, { useState, useEffect } from 'react';
import { QRCodeSVG } from 'qrcode.react';
import { QrCode, Printer, ExternalLink, Copy, Check, Plus, Trash2, RefreshCw, AlertTriangle, X } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { apiService } from '../services/api';

export function MesasQrView() {
  const { negocio } = useAuth();
  const [mesas, setMesas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [copiedMesa, setCopiedMesa] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // Modal de confirmación para eliminar mesa
  const [mesaToDelete, setMesaToDelete] = useState(null);

  const loadMesas = async () => {
    try {
      setLoading(true);
      const data = await apiService.getMesas(negocio?.id);
      setMesas(data);
    } catch (err) {
      console.error('Error cargando mesas:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadMesas();
  }, [negocio]);

  const getMesaUrl = (num) => {
    const origin = typeof window !== 'undefined' ? window.location.origin : 'https://gst-resto-bar.onrender.com';
    return `${origin}/?mesa=${num}`;
  };

  const handleCopy = (num) => {
    const url = getMesaUrl(num);
    navigator.clipboard.writeText(url);
    setCopiedMesa(num);
    setTimeout(() => setCopiedMesa(null), 2000);
  };

  const handlePrint = () => {
    window.print();
  };

  const handleAddMesa = async () => {
    try {
      setIsSubmitting(true);
      await apiService.crearMesa({ negocioId: negocio?.id });
      await loadMesas();
    } catch (err) {
      console.error('Error al agregar mesa:', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteMesa = async () => {
    if (!mesaToDelete) return;
    try {
      setIsSubmitting(true);
      await apiService.eliminarMesa(mesaToDelete.id, negocio?.id);
      setMesaToDelete(null);
      await loadMesas();
    } catch (err) {
      console.error('Error al eliminar mesa:', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 pb-20">
      
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 rounded-2xl shadow-sm transition-colors duration-200">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-emerald-500 text-slate-950 flex items-center justify-center shadow-sm shrink-0 font-bold text-xl">
            <QrCode className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-xl sm:text-2xl font-extrabold text-slate-900 dark:text-white">Administración de Mesas y Códigos QR</h1>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              {negocio?.nombre || 'GST Resto Bar'} &bull; Administra, agrega o elimina mesas e imprime sus stickers QR ({mesas.length} mesas registradas).
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2.5 flex-wrap no-print">
          <button
            onClick={loadMesas}
            className="p-2.5 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 rounded-xl text-xs font-bold transition-colors border border-slate-200 dark:border-slate-700"
            title="Recargar mesas"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          </button>

          <button
            onClick={handleAddMesa}
            disabled={isSubmitting}
            className="px-4 py-2.5 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black rounded-xl text-xs flex items-center gap-2 transition-all shadow-md shadow-emerald-500/20 active:scale-95 disabled:opacity-50"
          >
            <Plus className="w-4 h-4" />
            <span>Agregar Mesa</span>
          </button>

          <button
            onClick={handlePrint}
            className="px-4 py-2.5 bg-slate-900 dark:bg-slate-800 hover:bg-slate-800 text-white font-bold rounded-xl text-xs flex items-center gap-2 transition-all border border-slate-700 shadow-sm"
          >
            <Printer className="w-4 h-4" />
            <span>Imprimir Stickers</span>
          </button>
        </div>
      </div>

      {/* Grilla de Códigos QR */}
      {loading ? (
        <div className="py-20 text-center text-slate-500 text-xs flex flex-col items-center gap-2">
          <RefreshCw className="w-6 h-6 animate-spin text-emerald-500" />
          <span>Cargando mesas...</span>
        </div>
      ) : mesas.length === 0 ? (
        <div className="py-16 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl text-center text-slate-500 text-xs">
          No hay mesas registradas. Haz clic en <strong>"Agregar Mesa"</strong> para crear la primera.
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-6">
          {mesas.map(m => {
            const num = m.numero_mesa;
            const url = getMesaUrl(num);

            return (
              <div 
                key={m.id}
                className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 flex flex-col items-center justify-between text-center hover:border-emerald-500/50 transition-all shadow-sm relative group"
              >
                {/* Botón Eliminar Mesa */}
                <button
                  onClick={() => setMesaToDelete(m)}
                  className="absolute top-3 right-3 p-1.5 rounded-lg bg-rose-500/10 text-rose-500 hover:bg-rose-500 hover:text-white transition-colors no-print"
                  title="Eliminar Mesa"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>

                <div className="w-full pb-3 border-b border-slate-100 dark:border-slate-800 mb-4 pr-6">
                  <span className="text-[10px] font-black uppercase text-emerald-600 dark:text-emerald-400 tracking-wider">
                    {negocio?.nombre || 'GST Resto Bar'}
                  </span>
                  <h3 className="text-xl font-black text-slate-900 dark:text-white">Mesa #{num}</h3>
                </div>

                {/* QR Container */}
                <div className="p-3 bg-white rounded-xl border border-slate-200 shadow-inner mb-4">
                  <QRCodeSVG
                    value={url}
                    size={140}
                    bgColor="#ffffff"
                    fgColor="#090d16"
                    level="H"
                    includeMargin={false}
                  />
                </div>

                <p className="text-[10px] text-slate-500 dark:text-slate-400 mb-4 font-mono truncate max-w-full px-2">
                  ?mesa={num}
                </p>

                {/* Acciones del QR */}
                <div className="flex items-center gap-2 w-full pt-2 border-t border-slate-100 dark:border-slate-800 no-print">
                  <button
                    onClick={() => handleCopy(num)}
                    className="flex-1 py-2 px-3 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 text-xs font-bold flex items-center justify-center gap-1.5 transition-colors border border-slate-200 dark:border-slate-700"
                    title="Copiar URL para cliente"
                  >
                    {copiedMesa === num ? (
                      <>
                        <Check className="w-3.5 h-3.5 text-emerald-500" />
                        <span className="text-emerald-500 font-black">¡Copiado!</span>
                      </>
                    ) : (
                      <>
                        <Copy className="w-3.5 h-3.5" />
                        <span>Copiar Link</span>
                      </>
                    )}
                  </button>

                  <a
                    href={url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="p-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white transition-colors border border-slate-200 dark:border-slate-700"
                    title="Probar vista de cliente"
                  >
                    <ExternalLink className="w-4 h-4" />
                  </a>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* MODAL CONFIRMAR ELIMINACIÓN DE MESA */}
      {mesaToDelete && (
        <div className="fixed inset-0 z-50 bg-slate-950/70 dark:bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 w-full max-w-sm rounded-2xl p-6 shadow-2xl space-y-4 text-center">
            <div className="w-12 h-12 rounded-full bg-rose-500/10 text-rose-500 flex items-center justify-center mx-auto">
              <AlertTriangle className="w-6 h-6" />
            </div>

            <div>
              <h3 className="font-extrabold text-base text-slate-900 dark:text-white">¿Eliminar Mesa #{mesaToDelete.numero_mesa}?</h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                ¿Estás seguro de eliminar la <strong className="text-slate-800 dark:text-slate-200">Mesa #{mesaToDelete.numero_mesa}</strong>? Ya no estará disponible para comandas ni QR.
              </p>
            </div>

            <div className="flex items-center justify-center gap-3 pt-2">
              <button
                onClick={() => setMesaToDelete(null)}
                className="px-4 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-bold text-xs"
              >
                Cancelar
              </button>
              <button
                onClick={handleDeleteMesa}
                disabled={isSubmitting}
                className="px-4 py-2 rounded-xl bg-rose-600 text-white font-black text-xs shadow-md hover:bg-rose-500 disabled:opacity-50"
              >
                {isSubmitting ? 'Eliminando...' : 'Sí, Eliminar'}
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
