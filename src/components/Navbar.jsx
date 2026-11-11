import React, { useState } from 'react';
import { Wine, LayoutDashboard, QrCode, Users, LogOut, Sun, Moon, Package, BarChart3, Sparkles, Menu, X } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';

export function Navbar({ activeTab, setActiveTab, currentMesaNum, isQRClient }) {
  const { user, profile, negocio, logout } = useAuth();
  const { isDark, toggleTheme } = useTheme();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const isAdmin = profile?.rol === 'admin';
  const isEmpleado = profile?.rol === 'empleado';
  const isCliente = profile?.rol === 'cliente';

  const branding = React.useMemo(() => {
    try {
      const saved = localStorage.getItem('gst_resto_branding');
      return saved ? JSON.parse(saved) : {};
    } catch {
      return {};
    }
  }, []);

  const brandName = branding.name || negocio?.nombre || 'GST Resto Bar';
  const brandLogo = branding.logoUrl || negocio?.logo_url;

  const handleNavClick = (tab) => {
    setActiveTab(tab);
    setMobileMenuOpen(false);
  };

  return (
    <header className="sticky top-0 z-40 bg-white/95 dark:bg-slate-950/95 backdrop-blur-md border-b border-slate-200 dark:border-slate-800 shadow-sm transition-colors duration-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          
          {/* LOGO Y MARCA COMERCIAL */}
          <div 
            className="flex items-center gap-3 cursor-pointer group"
            onClick={() => {
              if (!isQRClient) {
                handleNavClick(isAdmin ? 'caja' : isEmpleado ? 'mesero' : 'menu');
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

          {/* MENÚ MESA QR */}
          {isQRClient ? (
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-2 bg-slate-100 dark:bg-slate-900 border border-emerald-500/30 px-3.5 py-1.5 rounded-full">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                <span className="text-xs font-bold text-slate-800 dark:text-slate-200">
                  Mesa #{currentMesaNum} &bull; Menú de Consulta
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
            <>
              {/* DESKTOP NAVIGATION (MD UP) */}
              <div className="hidden md:flex items-center gap-3">
                <nav className="flex items-center gap-1.5 sm:gap-2">
                  
                  {/* CLIENTE: PEDIDOS A DOMICILIO */}
                  {isCliente && (
                    <button
                      onClick={() => handleNavClick('menu')}
                      className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all ${
                        activeTab === 'menu'
                          ? 'bg-amber-500 text-slate-950 shadow-md'
                          : 'text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-900'
                      }`}
                    >
                      <Package className="w-4 h-4 text-amber-500" />
                      <span>Domicilios & Carta</span>
                    </button>
                  )}

                  {/* EMPLEADO: MODO MESERO */}
                  {isEmpleado && (
                    <button
                      onClick={() => handleNavClick('mesero')}
                      className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all ${
                        activeTab === 'mesero'
                          ? 'bg-emerald-500 text-slate-950 shadow-md shadow-emerald-500/20'
                          : 'text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-900'
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
                        onClick={() => handleNavClick('caja')}
                        className={`flex items-center gap-2 px-3 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all ${
                          activeTab === 'caja'
                            ? 'bg-emerald-500 text-slate-950 shadow-md shadow-emerald-500/20'
                            : 'text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-900'
                        }`}
                      >
                        <LayoutDashboard className="w-4 h-4" />
                        <span>Caja / Cocina</span>
                      </button>

                      <button
                        onClick={() => handleNavClick('reportes')}
                        className={`flex items-center gap-2 px-3 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all ${
                          activeTab === 'reportes'
                            ? 'bg-slate-200 dark:bg-slate-800 text-emerald-600 dark:text-emerald-400 border border-slate-300 dark:border-slate-700'
                            : 'text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-900'
                        }`}
                      >
                        <BarChart3 className="w-4 h-4" />
                        <span>Reportes</span>
                      </button>

                      <button
                        onClick={() => handleNavClick('productos')}
                        className={`flex items-center gap-2 px-3 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all ${
                          activeTab === 'productos'
                            ? 'bg-slate-200 dark:bg-slate-800 text-emerald-600 dark:text-emerald-400 border border-slate-300 dark:border-slate-700'
                            : 'text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-900'
                        }`}
                      >
                        <Package className="w-4 h-4" />
                        <span>Productos</span>
                      </button>

                      <button
                        onClick={() => handleNavClick('usuarios')}
                        className={`flex items-center gap-2 px-3 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all ${
                          activeTab === 'usuarios'
                            ? 'bg-slate-200 dark:bg-slate-800 text-emerald-600 dark:text-emerald-400 border border-slate-300 dark:border-slate-700'
                            : 'text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-900'
                        }`}
                      >
                        <Users className="w-4 h-4" />
                        <span>Personal</span>
                      </button>

                      <button
                        onClick={() => handleNavClick('mesas')}
                        className={`flex items-center gap-2 px-3 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all ${
                          activeTab === 'mesas'
                            ? 'bg-slate-200 dark:bg-slate-800 text-emerald-600 dark:text-emerald-400 border border-slate-300 dark:border-slate-700'
                            : 'text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-900'
                        }`}
                      >
                        <QrCode className="w-4 h-4" />
                        <span>Códigos QR</span>
                      </button>

                      <button
                        onClick={() => handleNavClick('branding')}
                        className={`flex items-center gap-2 px-3 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all ${
                          activeTab === 'branding'
                            ? 'bg-amber-500 text-slate-950 shadow-md shadow-amber-500/20'
                            : 'text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-900'
                        }`}
                      >
                        <Sparkles className="w-4 h-4 text-amber-500" />
                        <span>Branding & Promos</span>
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
                    <Sun className="w-5 h-5 text-amber-400" />
                  ) : (
                    <Moon className="w-5 h-5 text-slate-700" />
                  )}
                </button>

                {/* Insignia de Usuario y Logout */}
                {user && profile && (
                  <div className="flex items-center gap-2.5 pl-3 border-l border-slate-200 dark:border-slate-800">
                    <div className="flex flex-col items-end text-xs">
                      <span className="font-bold text-slate-800 dark:text-slate-200 leading-tight">{profile.nombre}</span>
                      <span className="text-[9px] font-black uppercase tracking-wider px-1.5 py-0.2 rounded mt-0.5 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
                        {profile.rol}
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

              {/* HAMBURGER TOGGLE BUTTON (MOBILE ONLY) */}
              <div className="flex md:hidden items-center gap-2">
                <button
                  onClick={toggleTheme}
                  className="p-2 rounded-xl text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-900"
                >
                  {isDark ? <Sun className="w-5 h-5 text-amber-400" /> : <Moon className="w-5 h-5 text-slate-700" />}
                </button>

                <button
                  onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                  className="p-2 rounded-xl bg-slate-100 dark:bg-slate-900 text-slate-700 dark:text-slate-300 hover:text-amber-500 border border-slate-200 dark:border-slate-800"
                >
                  {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
                </button>
              </div>
            </>
          )}

        </div>
      </div>

      {/* DROPDOWN MENU PARA DISPOSITIVOS MÓVILES */}
      {!isQRClient && mobileMenuOpen && (
        <div className="md:hidden border-t border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 px-4 py-4 space-y-3 animate-fade-in shadow-2xl">
          {user && profile && (
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-900 text-xs">
              <div>
                <p className="font-bold text-slate-900 dark:text-white">{profile.nombre}</p>
                <p className="text-[10px] text-slate-500 uppercase font-black">{profile.rol}</p>
              </div>
              <button
                onClick={logout}
                className="px-3 py-1 bg-rose-500/10 text-rose-500 rounded-lg text-xs font-bold flex items-center gap-1"
              >
                <LogOut className="w-3.5 h-3.5" />
                <span>Salir</span>
              </button>
            </div>
          )}

          <nav className="flex flex-col space-y-1.5 text-xs font-bold">
            {isCliente && (
              <button
                onClick={() => handleNavClick('menu')}
                className={`p-3 rounded-xl flex items-center gap-3 text-left ${
                  activeTab === 'menu' ? 'bg-amber-500 text-slate-950 font-black' : 'text-slate-700 dark:text-slate-300 bg-slate-50 dark:bg-slate-900'
                }`}
              >
                <Package className="w-4 h-4" />
                <span>Domicilios & Carta Digital</span>
              </button>
            )}

            {isEmpleado && (
              <button
                onClick={() => handleNavClick('mesero')}
                className={`p-3 rounded-xl flex items-center gap-3 text-left ${
                  activeTab === 'mesero' ? 'bg-emerald-500 text-slate-950 font-black' : 'text-slate-700 dark:text-slate-300 bg-slate-50 dark:bg-slate-900'
                }`}
              >
                <Users className="w-4 h-4" />
                <span>Modo Mesero POS</span>
              </button>
            )}

            {isAdmin && (
              <>
                <button
                  onClick={() => handleNavClick('caja')}
                  className={`p-3 rounded-xl flex items-center gap-3 text-left ${
                    activeTab === 'caja' ? 'bg-emerald-500 text-slate-950 font-black' : 'text-slate-700 dark:text-slate-300 bg-slate-50 dark:bg-slate-900'
                  }`}
                >
                  <LayoutDashboard className="w-4 h-4" />
                  <span>Caja & Cocina</span>
                </button>

                <button
                  onClick={() => handleNavClick('reportes')}
                  className={`p-3 rounded-xl flex items-center gap-3 text-left ${
                    activeTab === 'reportes' ? 'bg-amber-500 text-slate-950 font-black' : 'text-slate-700 dark:text-slate-300 bg-slate-50 dark:bg-slate-900'
                  }`}
                >
                  <BarChart3 className="w-4 h-4" />
                  <span>Reportes de Ventas</span>
                </button>

                <button
                  onClick={() => handleNavClick('productos')}
                  className={`p-3 rounded-xl flex items-center gap-3 text-left ${
                    activeTab === 'productos' ? 'bg-amber-500 text-slate-950 font-black' : 'text-slate-700 dark:text-slate-300 bg-slate-50 dark:bg-slate-900'
                  }`}
                >
                  <Package className="w-4 h-4" />
                  <span>Gestión de Productos</span>
                </button>

                <button
                  onClick={() => handleNavClick('usuarios')}
                  className={`p-3 rounded-xl flex items-center gap-3 text-left ${
                    activeTab === 'usuarios' ? 'bg-amber-500 text-slate-950 font-black' : 'text-slate-700 dark:text-slate-300 bg-slate-50 dark:bg-slate-900'
                  }`}
                >
                  <Users className="w-4 h-4" />
                  <span>Gestión de Personal</span>
                </button>

                <button
                  onClick={() => handleNavClick('mesas')}
                  className={`p-3 rounded-xl flex items-center gap-3 text-left ${
                    activeTab === 'mesas' ? 'bg-amber-500 text-slate-950 font-black' : 'text-slate-700 dark:text-slate-300 bg-slate-50 dark:bg-slate-900'
                  }`}
                >
                  <QrCode className="w-4 h-4" />
                  <span>Códigos QR</span>
                </button>

                <button
                  onClick={() => handleNavClick('branding')}
                  className={`p-3 rounded-xl flex items-center gap-3 text-left ${
                    activeTab === 'branding' ? 'bg-amber-500 text-slate-950 font-black' : 'text-slate-700 dark:text-slate-300 bg-slate-50 dark:bg-slate-900'
                  }`}
                >
                  <Sparkles className="w-4 h-4" />
                  <span>Branding & Promos</span>
                </button>
              </>
            )}
          </nav>
        </div>
      )}

    </header>
  );
}

export default Navbar;
