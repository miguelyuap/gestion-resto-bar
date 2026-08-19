import React from 'react';
import { Wine, LayoutDashboard, QrCode, AlertCircle, Users, LogOut } from 'lucide-react';
import { isSupabaseConfigured } from '../lib/supabase';
import { useAuth } from '../context/AuthContext';

export function Navbar({ activeTab, setActiveTab, currentMesaNum, isQRClient }) {
  const { user, profile, logout } = useAuth();
  const isAdmin = profile?.rol === 'admin';
  const isEmpleado = profile?.rol === 'empleado';

  return (
    <header className="sticky top-0 z-40 bg-[#080c14]/95 backdrop-blur-md border-b border-emerald-500/20 shadow-lg shadow-emerald-500/5">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          
          {/* Logo y Nombre de Marca */}
          <div 
            className="flex items-center gap-3 cursor-pointer group"
            onClick={() => {
              if (!isQRClient) {
                setActiveTab(isAdmin ? 'caja' : 'mesero');
              }
            }}
          >
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-emerald-500 via-cyan-400 to-pink-500 p-0.5 flex items-center justify-center shadow-lg shadow-emerald-500/20 group-hover:scale-105 transition-transform">
              <div className="w-full h-full bg-[#080c14] rounded-[14px] flex items-center justify-center relative overflow-hidden">
                <span className="text-xl">🍹</span>
              </div>
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-black text-lg tracking-tight bg-gradient-to-r from-emerald-400 via-cyan-300 to-pink-400 bg-clip-text text-transparent">
                  Alo Mas Agogo
                </span>
                <span className="text-[9px] font-extrabold px-1.5 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
                  BAR
                </span>
              </div>
              <p className="text-[11px] text-emerald-400/80 font-bold tracking-wider uppercase">
                Granizados & Flow
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
            /* NAVEGACIÓN ESTRECHA DIFERENCIADA POR ROL */
            <div className="flex items-center gap-3">
              <nav className="flex items-center gap-1 sm:gap-2">
                
                {/* VISTA EMPLEADO: SOLO TOMA DE PEDIDOS (MODO MESERO) */}
                {isEmpleado && (
                  <button
                    onClick={() => setActiveTab('mesero')}
                    className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs sm:text-sm font-black transition-all ${
                      activeTab === 'mesero'
                        ? 'bg-gradient-to-r from-emerald-500 to-cyan-400 text-slate-950 shadow-lg shadow-emerald-500/25'
                        : 'text-slate-300 hover:bg-slate-800/60 hover:text-white'
                    }`}
                  >
                    <Users className="w-4 h-4" />
                    <span>Modo Mesero</span>
                  </button>
                )}

                {/* VISTAS EXCLUSIVAS DEL ADMINISTRADOR: CAJA, GESTIÓN DE USUARIOS Y CÓDIGOS QR */}
                {isAdmin && (
                  <>
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
                      onClick={() => setActiveTab('usuarios')}
                      className={`flex items-center gap-2 px-3 py-2 rounded-xl text-xs sm:text-sm font-medium transition-all ${
                        activeTab === 'usuarios'
                          ? 'bg-purple-600 text-white font-extrabold shadow-lg shadow-purple-600/25'
                          : 'text-slate-300 hover:bg-slate-800/60 hover:text-white'
                      }`}
                    >
                      <Users className="w-4 h-4" />
                      <span className="hidden sm:inline">Usuarios</span>
                    </button>

                    <button
                      onClick={() => setActiveTab('mesas')}
                      className={`flex items-center gap-2 px-3 py-2 rounded-xl text-xs sm:text-sm font-medium transition-all ${
                        activeTab === 'mesas'
                          ? 'bg-slate-800 text-emerald-300 font-bold border border-slate-700'
                          : 'text-slate-300 hover:bg-slate-800/60 hover:text-white'
                      }`}
                    >
                      <QrCode className="w-4 h-4" />
                      <span className="hidden sm:inline">Códigos QR</span>
                    </button>
                  </>
                )}

              </nav>

              {/* Insignia de Usuario y Logout */}
              {user && profile && (
                <div className="flex items-center gap-2 pl-3 border-l border-slate-800">
                  <div className="hidden lg:flex flex-col items-end text-[11px]">
                    <span className="font-bold text-white leading-none">{profile.nombre}</span>
                    <span className={`text-[9px] font-black uppercase tracking-wider px-1.5 py-0.2 rounded mt-0.5 ${
                      isAdmin 
                        ? 'bg-pink-500/20 text-pink-400 border border-pink-500/30' 
                        : 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                    }`}>
                      {isAdmin ? '⭐ Admin' : '🧑‍🍳 Empleado'}
                    </span>
                  </div>

                  <button
                    onClick={logout}
                    className="p-2 rounded-xl text-slate-400 hover:text-rose-400 hover:bg-slate-800 transition-colors"
                    title="Cerrar Sesión"
                  >
                    <LogOut className="w-4 h-4" />
                  </button>
                </div>
              )}
            </div>
          )}

        </div>
      </div>
    </header>
  );
}
