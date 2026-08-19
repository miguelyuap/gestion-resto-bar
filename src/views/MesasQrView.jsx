import React from 'react';
import { QRCodeSVG } from 'qrcode.react';
import { QrCode, Printer, ExternalLink, Copy, Check } from 'lucide-react';

export function MesasQrView() {
  const [copiedMesa, setCopiedMesa] = React.useState(null);

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

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 pb-20">
      
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8 bg-slate-900/80 border border-slate-800 p-6 rounded-3xl backdrop-blur-md">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-purple-500 to-indigo-500 text-white flex items-center justify-center shadow-lg shadow-purple-500/20 shrink-0">
            <QrCode className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-2xl font-extrabold text-white">Administración de Códigos QR por Mesa</h1>
            <p className="text-xs text-slate-400 mt-0.5">
              Imprime los stckers QR para colocar en cada mesa del bar y permitir el pedido directo de los clientes.
            </p>
          </div>
        </div>

        <button
          onClick={handlePrint}
          className="px-5 py-3 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-bold rounded-2xl text-xs flex items-center justify-center gap-2 transition-all shadow-lg shadow-purple-500/25 active:scale-95 no-print"
        >
          <Printer className="w-4 h-4" />
          <span>Imprimir Stickers de Mesas</span>
        </button>
      </div>

      {/* Grilla de Códigos QR (Imprimible) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-6">
        {Array.from({ length: 10 }, (_, i) => i + 1).map(num => {
          const url = getMesaUrl(num);

          return (
            <div 
              key={num}
              className="bg-slate-900/90 border border-slate-800 rounded-3xl p-5 flex flex-col items-center justify-between text-center hover:border-purple-500/50 transition-all shadow-xl"
            >
              {/* Encabezado Sticker */}
              <div className="w-full pb-3 border-b border-slate-800 mb-4 flex items-center justify-between">
                <span className="text-xs font-bold text-slate-400">ALO MAS AGOGO</span>
                <span className="px-2.5 py-0.5 rounded-full bg-pink-500/20 text-pink-300 font-extrabold text-xs border border-pink-500/30">
                  MESA #{num}
                </span>
              </div>

              {/* QR Code Container */}
              <div className="p-3 bg-white rounded-2xl shadow-inner mb-4 inline-block">
                <QRCodeSVG
                  value={url}
                  size={140}
                  level="H"
                  includeMargin={false}
                />
              </div>

              <p className="text-[11px] text-slate-300 font-medium mb-4">
                Escanea con la cámara de tu celular para pedir granizados y licores
              </p>

              {/* Botones de Acción */}
              <div className="w-full flex items-center gap-2 no-print">
                <button
                  onClick={() => handleCopy(num)}
                  className="flex-1 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 text-[11px] font-bold rounded-xl flex items-center justify-center gap-1 transition-colors"
                >
                  {copiedMesa === num ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copiedMesa === num ? '¡Copiado!' : 'Copiar URL'}</span>
                </button>

                <a
                  href={`/?mesa=${num}`}
                  target="_blank"
                  rel="noreferrer"
                  className="p-2 bg-purple-600/20 text-purple-300 hover:bg-purple-600/30 rounded-xl transition-colors"
                  title="Probar vista de mesa"
                >
                  <ExternalLink className="w-4 h-4" />
                </a>
              </div>
            </div>
          );
        })}
      </div>

    </div>
  );
}
