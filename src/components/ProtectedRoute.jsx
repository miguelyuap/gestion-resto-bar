import React from 'react';
import { ShieldAlert, ArrowRight, LogOut } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { LoginView } from '../views/LoginView';

export function ProtectedRoute({ allowedRoles, children, onRedirect }) {
  const { user, profile, loading, logout } = useAuth();

  if (loading) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center">
        <div className="w-10 h-10 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin mb-4" />
        <p className="text-xs text-slate-400 font-bold uppercase tracking-wider">Verificando permisos y rol...</p>
      </div>
    );
  }

  // Si no está autenticado, mostrar formulario de Login
  if (!user || !profile) {
    return <LoginView onLoginSuccess={(prof) => onRedirect && onRedirect(prof)} />;
  }

  // Si se especificaron roles permitidos y el rol del usuario no está en la lista
  if (allowedRoles && allowedRoles.length > 0 && !allowedRoles.includes(profile.rol)) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-[#080c14] border border-rose-500/40 rounded-3xl p-8 text-center shadow-2xl">
          <div className="w-14 h-14 bg-rose-500/20 text-rose-400 rounded-2xl flex items-center justify-center mx-auto mb-4 border border-rose-500/40">
            <ShieldAlert className="w-8 h-8" />
          </div>
          <span className="text-xs font-black text-rose-400 uppercase tracking-widest block mb-1">
            Acceso Denegado
          </span>
          <h3 className="text-xl font-extrabold text-white mb-2">Se Requieren Permisos de Administrador</h3>
          <p className="text-xs text-slate-300 mb-6">
            Tu cuenta actual está registrada con el rol de <strong className="text-emerald-400 uppercase">'{profile.rol}'</strong>. La pantalla de Caja y Facturación es exclusiva para Administradores.
          </p>

          <div className="flex items-center justify-center gap-3">
            <button
              onClick={() => onRedirect && onRedirect(profile, '/mesero')}
              className="px-4 py-2.5 bg-emerald-500 text-slate-950 font-black rounded-xl text-xs flex items-center gap-2"
            >
              <span>Ir a Toma de Pedidos (Mesero)</span>
              <ArrowRight className="w-4 h-4" />
            </button>
            <button
              onClick={logout}
              className="px-3 py-2.5 bg-slate-800 text-slate-300 hover:text-white rounded-xl text-xs font-bold flex items-center gap-1.5"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span>Cambiar Cuenta</span>
            </button>
          </div>
        </div>
      </div>
    );
  }

  return children;
}
