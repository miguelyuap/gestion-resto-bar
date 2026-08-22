import React from 'react';
import { Wine, LayoutDashboard, QrCode, Users, LogOut, Sun, Moon, Package, BarChart3 } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';

export function Navbar({ activeTab, setActiveTab, currentMesaNum, isQRClient }) {
  const { user, profile, negocio, logout } = useAuth();
  const { isDark, toggleTheme } = useTheme();
  const isAdmin = profile?.rol === 'admin';
  const isEmpleado = profile?.rol === 'empleado';

  const brandName = negocio?.nombre || 'GST Resto Bar';
  const brandLogo = negocio?.logo_url;

  return (
    <header className="sticky top-0 z-40 bg-white/90 dark:bg-slate-950/90 backdrop-blur-md border-b border-slate-200 dark:border-slate-800 shadow-sm transition-colors duration-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          
          {/* Logo y Marca Comercial */}
          <div 
            className="flex items-center gap-3 cursor-pointer group"
            onClick={() => {
              if (!isQRClient) {
                setActiveTab(isAdmin ? 'caja' : 'mesero');
              }
            }}
          >
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-emerald-500 to-teal-400 p-0.5 flex items-center justify-center shadow-md shadow-emerald-500/10 group-hover:scale-105 transition-transform">
              <div className="w-full h-full bg-slate-900 dark:bg-slate-950 rounded-[10px] flex items-center justify-center relative overflow-hidden">
                {brandLogo ? (
                  <img src={brandLogo} alt={brandName} className="w-full h-full object-cover rounded-[10px]" />
                ) : (
                  <span className="text-xl">🍸</span>
                )}
              </div>
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-extrabold text-base sm:text-lg tracking-tight text-slate-900 dark:text-white group-hover:text-emerald-500 transition-colors">
                  {brandName}
                </span>
                <span className="text-[10px] font-black px-1.5 py-0.5 rounded bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 uppercase">
                  SaaS
                </span>
              </div>
              <p className="text-[10px] text-slate-500 dark:text-slate-400 font-medium tracking-wide">
                Sistema POS & Menú Digital
              </p>
            </div>
          </div>

          {/* Badge de Mesa para Cliente QR */}
          {isQRClient ? (
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-2 bg-slate-100 dark:bg-slate-900 border border-emerald-500/30 px-3.5 py-1.5 rounded-full">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                <span className="text-xs font-bold text-slate-800 dark:text-slate-200">
                  Mesa #{currentMesaNum} &bull; Menú Digital
                </span>
              </div>

              <button
                onClick={toggleTheme}
                className="p-2 rounded-xl text-slate-600 dark:text-slate-400 hover:text-emerald-500 dark:hover:text-emerald-400 hover:bg-slate-100 dark:hover:bg-slate-900 transition-colors"
                title={isDark ? "Cambiar a Modo Claro" : "Cambiar a Modo Oscuro"}
              >
                {isDark ? <Sun className="w-5 h-5 text-amber-400" /> : <Moon className="w-5 h-5 text-slate-700" />}
              </button>
            </div>
          ) : (
            /* NAVEGACIÓN Y CONTROLES POR ROL */
            <div className="flex items-center gap-3">
              <nav className="flex items-center gap-1.5 sm:gap-2">
                
                {/* EMPLEADO: MODO MESERO */}
                {isEmpleado && (
                  <button
                    onClick={() => setActiveTab('mesero')}
                    className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all ${
                      activeTab === 'mesero'
                        ? 'bg-emerald-500 text-slate-950 shadow-md shadow-emerald-500/20'
                        : 'text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-900 hover:text-slate-900 dark:hover:text-white'
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
                          : 'text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-900 hover:text-slate-900 dark:hover:text-white'
                      }`}
                    >
                      <LayoutDashboard className="w-4 h-4" />
                      <span>Caja / Cocina</span>
                    </button>

                    <button
                      onClick={() => setActiveTab('reportes')}
                      className={`flex items-center gap-2 px-3 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all ${
                        activeTab === 'reportes'
                          ? 'bg-slate-200 dark:bg-slate-800 text-emerald-600 dark:text-emerald-400 border border-slate-300 dark:border-slate-700'
                          : 'text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-900 hover:text-slate-900 dark:hover:text-white'
                      }`}
                    >
                      <BarChart3 className="w-4 h-4" />
                      <span className="hidden sm:inline">Reportes</span>
                    </button>

                    <button
                      onClick={() => setActiveTab('productos')}
                      className={`flex items-center gap-2 px-3 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all ${
                        activeTab === 'productos'
                          ? 'bg-slate-200 dark:bg-slate-800 text-emerald-600 dark:text-emerald-400 border border-slate-300 dark:border-slate-700'
                          : 'text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-900 hover:text-slate-900 dark:hover:text-white'
                      }`}
                    >
                      <Package className="w-4 h-4" />
                      <span className="hidden sm:inline">Productos</span>
                    </button>

                    <button
                      onClick={() => setActiveTab('usuarios')}
                      className={`flex items-center gap-2 px-3 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all ${
                        activeTab === 'usuarios'
                          ? 'bg-slate-200 dark:bg-slate-800 text-emerald-600 dark:text-emerald-400 border border-slate-300 dark:border-slate-700'
                          : 'text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-900 hover:text-slate-900 dark:hover:text-white'
                      }`}
                    >
                      <Users className="w-4 h-4" />
                      <span className="hidden sm:inline">Personal</span>
                    </button>

                    <button
                      onClick={() => setActiveTab('mesas')}
                      className={`flex items-center gap-2 px-3 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all ${
                        activeTab === 'mesas'
                          ? 'bg-slate-200 dark:bg-slate-800 text-emerald-600 dark:text-emerald-400 border border-slate-300 dark:border-slate-700'
                          : 'text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-900 hover:text-slate-900 dark:hover:text-white'
                      }`}
                    >
                      <QrCode className="w-4 h-4" />
                      <span className="hidden sm:inline">Códigos QR</span>
                    </button>
                  </>
                )}

              </nav>

              {/* BOTÓN MODO OSCURO / MODO CLARO */}
              <button
                onClick={toggleTheme}
                className="p-2 rounded-xl text-slate-600 dark:text-slate-400 hover:text-emerald-500 dark:hover:text-emerald-400 hover:bg-slate-100 dark:hover:bg-slate-900 transition-colors"
                title={isDark ? "Cambiar a Modo Claro" : "Cambiar a Modo Oscuro"}
              >
                {isDark ? (
                  <Sun className="w-5 h-5 text-amber-400 hover:rotate-45 transition-transform" />
                ) : (
                  <Moon className="w-5 h-5 text-slate-700 hover:-rotate-12 transition-transform" />
                )}
              </button>

              {/* Insignia de Usuario y Logout */}
              {user && profile && (
                <div className="flex items-center gap-2.5 pl-3 border-l border-slate-200 dark:border-slate-800">
                  <div className="hidden lg:flex flex-col items-end text-xs">
                    <span className="font-bold text-slate-800 dark:text-slate-200 leading-tight">{profile.nombre}</span>
                    <span className={`text-[9px] font-black uppercase tracking-wider px-1.5 py-0.2 rounded mt-0.5 ${
                      isAdmin 
                        ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20' 
                        : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700'
                    }`}>
                      {isAdmin ? 'Admin' : 'Empleado'}
                    </span>
                  </div>

                  <button
                    onClick={logout}
                    className="p-2 rounded-xl text-slate-500 hover:text-rose-500 hover:bg-slate-100 dark:hover:bg-slate-900 transition-colors"
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
