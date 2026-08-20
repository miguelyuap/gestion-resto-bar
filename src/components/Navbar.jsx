import React from 'react';
import { Wine, LayoutDashboard, QrCode, Users, LogOut, Store } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export function Navbar({ activeTab, setActiveTab, currentMesaNum, isQRClient }) {
  const { user, profile, negocio, logout } = useAuth();
  const isAdmin = profile?.rol === 'admin';
  const isEmpleado = profile?.rol === 'empleado';

  const brandName = negocio?.nombre || 'GST Resto Bar';
  const brandLogo = negocio?.logo_url;

  return (
    <header className="sticky top-0 z-40 bg-slate-950/90 backdrop-blur-md border-b border-slate-800 shadow-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          
          {/* Logo y Marca Comercial (GST Resto Bar / Dinámica por Tenant) */}
          <div 
            className="flex items-center gap-3 cursor-pointer group"
            onClick={() => {
              if (!isQRClient) {
                setActiveTab(isAdmin ? 'caja' : 'mesero');
              }
            }}
          >
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-emerald-500 to-teal-400 p-0.5 flex items-center justify-center shadow-md shadow-emerald-500/10 group-hover:scale-105 transition-transform">
              <div className="w-full h-full bg-slate-950 rounded-[10px] flex items-center justify-center relative overflow-hidden">
                {brandLogo ? (
                  <img src={brandLogo} alt={brandName} className="w-full h-full object-cover rounded-[10px]" />
                ) : (
                  <span className="text-xl">🍸</span>
                )}
              </div>
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-extrabold text-base sm:text-lg tracking-tight text-white group-hover:text-emerald-400 transition-colors">
                  {brandName}
                </span>
                <span className="text-[10px] font-black px-1.5 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 uppercase">
                  SaaS
                </span>
              </div>
              <p className="text-[10px] text-slate-400 font-medium tracking-wide">
                Sistema POS & Menú Digital
              </p>
            </div>
          </div>

          {/* Badge de Mesa para Cliente QR */}
          {isQRClient ? (
            <div className="flex items-center gap-2 bg-slate-900 border border-emerald-500/30 px-3.5 py-1.5 rounded-full">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              <span className="text-xs font-bold text-slate-200">
                Mesa #{currentMesaNum} &bull; Menú Digital
              </span>
            </div>
          ) : (
            /* NAVEGACIÓN Y CONTROLES POR ROL */
            <div className="flex items-center gap-3">
              <nav className="flex items-center gap-1.5 sm:gap-2">
                
                {/* VISTA EMPLEADO: MODO MESERO */}
                {isEmpleado && (
                  <button
                    onClick={() => setActiveTab('mesero')}
                    className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all ${
                      activeTab === 'mesero'
                        ? 'bg-emerald-500 text-slate-950 shadow-md shadow-emerald-500/20'
                        : 'text-slate-300 hover:bg-slate-900 hover:text-white'
                    }`}
                  >
                    <Users className="w-4 h-4" />
                    <span>Modo Mesero</span>
                  </button>
                )}

                {/* VISTAS EXCLUSIVAS DEL ADMINISTRADOR */}
                {isAdmin && (
                  <>
                    <button
                      onClick={() => setActiveTab('caja')}
                      className={`flex items-center gap-2 px-3 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all ${
                        activeTab === 'caja'
                          ? 'bg-emerald-500 text-slate-950 shadow-md shadow-emerald-500/20'
                          : 'text-slate-300 hover:bg-slate-900 hover:text-white'
                      }`}
                    >
                      <LayoutDashboard className="w-4 h-4" />
                      <span>Caja / Cocina</span>
                    </button>

                    <button
                      onClick={() => setActiveTab('usuarios')}
                      className={`flex items-center gap-2 px-3 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all ${
                        activeTab === 'usuarios'
                          ? 'bg-slate-800 text-emerald-400 border border-slate-700'
                          : 'text-slate-300 hover:bg-slate-900 hover:text-white'
                      }`}
                    >
                      <Users className="w-4 h-4" />
                      <span className="hidden sm:inline">Personal</span>
                    </button>

                    <button
                      onClick={() => setActiveTab('mesas')}
                      className={`flex items-center gap-2 px-3 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all ${
                        activeTab === 'mesas'
                          ? 'bg-slate-800 text-emerald-400 border border-slate-700'
                          : 'text-slate-300 hover:bg-slate-900 hover:text-white'
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
                <div className="flex items-center gap-2.5 pl-3 border-l border-slate-800">
                  <div className="hidden lg:flex flex-col items-end text-xs">
                    <span className="font-bold text-slate-200 leading-tight">{profile.nombre}</span>
                    <span className={`text-[9px] font-black uppercase tracking-wider px-1.5 py-0.2 rounded mt-0.5 ${
                      isAdmin 
                        ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' 
                        : 'bg-slate-800 text-slate-300 border border-slate-700'
                    }`}>
                      {isAdmin ? 'Admin' : 'Empleado'}
                    </span>
                  </div>

                  <button
                    onClick={logout}
                    className="p-2 rounded-xl text-slate-400 hover:text-rose-400 hover:bg-slate-900 transition-colors"
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
