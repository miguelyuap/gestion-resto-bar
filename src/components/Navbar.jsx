import React from 'react';
import { Wine, LayoutDashboard, QrCode, AlertCircle, Users } from 'lucide-react';
import { isSupabaseConfigured } from '../lib/supabase';

export function Navbar({ activeTab, setActiveTab, currentMesaNum, isQRClient }) {
  return (
    <header className="sticky top-0 z-40 bg-[#080c14]/95 backdrop-blur-md border-b border-emerald-500/20 shadow-lg shadow-emerald-500/5">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          
          {/* Logo y Nombre de Marca */}
          <div 
            className="flex items-center gap-3 cursor-pointer group"
            onClick={() => !isQRClient && setActiveTab('menu')}
          >
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-emerald-500 via-cyan-400 to-pink-500 p-0.5 flex items-center justify-center shadow-lg shadow-emerald-500/20 group-hover:scale-105 transition-transform">
              <div className="w-full h-full bg-[#080c14] rounded-[14px] flex items-center justify-center relative overflow-hidden">
                <span className="text-xl">🍹</span>
              </div>
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-black text-lg tracking-tight bg-gradient-to-r from-emerald-400 via-cyan-300 to-pink-400 bg-clip-text text-transparent">
                  GRANIZADOS & FLOW
                </span>
                <span className="text-[9px] font-extrabold px-1.5 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
                  AGOGO
                </span>
              </div>
              <p className="text-[11px] text-emerald-400/80 font-bold tracking-wider uppercase">
                A lo Más Agogo Granizados
              </p>
            </div>
          </div>

          {/* Badge de Mesa para Cliente QR */}
          {isQRClient ? (
            <div className="flex items-center gap-2 bg-gradient-to-r from-emerald-500/10 via-cyan-500/10 to-pink-500/10 border border-emerald-500/40 px-4 py-1.5 rounded-full">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
              <span className="text-xs font-black text-emerald-300">
                Mesa #{currentMesaNum} &bull; Carta de Consulta
              </span>
            </div>
          ) : (
            /* Botones de Navegación EXCLUSIVOS DEL PERSONAL DEL BAR */
            <nav className="flex items-center gap-1 sm:gap-2">
              <button
                onClick={() => setActiveTab('menu')}
                className={`flex items-center gap-2 px-3 py-2 rounded-xl text-xs sm:text-sm font-medium transition-all ${
                  activeTab === 'menu'
                    ? 'bg-slate-800 text-emerald-300 font-extrabold border border-slate-700'
                    : 'text-slate-300 hover:bg-slate-800/60 hover:text-white'
                }`}
              >
                <Wine className="w-4 h-4" />
                <span className="hidden sm:inline">Carta Cliente</span>
              </button>

              <button
                onClick={() => setActiveTab('mesero')}
                className={`flex items-center gap-2 px-3 py-2 rounded-xl text-xs sm:text-sm font-medium transition-all ${
                  activeTab === 'mesero'
                    ? 'bg-gradient-to-r from-emerald-500 to-cyan-400 text-slate-950 font-black shadow-lg shadow-emerald-500/25'
                    : 'text-slate-300 hover:bg-slate-800/60 hover:text-white'
                }`}
              >
                <Users className="w-4 h-4" />
                <span>Modo Mesero</span>
              </button>

              <button
                onClick={() => setActiveTab('caja')}
                className={`flex items-center gap-2 px-3 py-2 rounded-xl text-xs sm:text-sm font-medium transition-all relative ${
                  activeTab === 'caja'
                    ? 'bg-gradient-to-r from-pink-500 to-rose-500 text-white font-extrabold shadow-lg shadow-pink-500/25'
                    : 'text-slate-300 hover:bg-slate-800/60 hover:text-white'
                }`}
              >
                <LayoutDashboard className="w-4 h-4" />
                <span>Caja / Realtime</span>
                <span className="hidden md:inline-flex w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              </button>

              <button
                onClick={() => setActiveTab('mesas')}
                className={`flex items-center gap-2 px-3 py-2 rounded-xl text-xs sm:text-sm font-medium transition-all ${
                  activeTab === 'mesas'
                    ? 'bg-purple-600 text-white font-bold shadow-lg shadow-purple-600/25'
                    : 'text-slate-300 hover:bg-slate-800/60 hover:text-white'
                }`}
              >
                <QrCode className="w-4 h-4" />
                <span className="hidden sm:inline">Códigos QR</span>
              </button>
            </nav>
          )}

        </div>
      </div>

      {!isSupabaseConfigured && !isQRClient && (
        <div className="bg-emerald-500/10 border-y border-emerald-500/20 px-4 py-1 text-center text-[11px] text-emerald-300 flex items-center justify-center gap-2">
          <AlertCircle className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
          <span>
            <strong>Modo Demostración Local:</strong> Los accesos de mesero, caja e impresión de QR están activos para administración.
          </span>
        </div>
      )}
    </header>
  );
}
