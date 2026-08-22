import React, { useState } from 'react';
import { Lock, Mail, ShieldAlert, LogIn } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export function LoginView({ onLoginSuccess }) {
  const { login, negocio } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email || !password) {
      setErrorMsg('Por favor ingresa tu correo y contraseña.');
      return;
    }

    try {
      setErrorMsg('');
      setIsSubmitting(true);
      const res = await login(email, password);
      if (onLoginSuccess) {
        onLoginSuccess(res.profile);
      }
    } catch (err) {
      console.error('Error al iniciar sesión:', err);
      setErrorMsg(err.message || 'Credenciales inválidas. Verifica tu correo y contraseña.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const brandName = negocio?.nombre || 'GST Resto Bar';

  return (
    <div className="min-h-[80vh] flex items-center justify-center p-4">
      <div className="w-full max-w-md bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-8 shadow-xl relative overflow-hidden transition-colors duration-200">
        
        <div className="relative z-10">
          
          {/* Header Marca */}
          <div className="text-center mb-8">
            <div className="w-14 h-14 mx-auto mb-3 rounded-2xl bg-emerald-500 text-slate-950 p-0.5 shadow-md shadow-emerald-500/20 flex items-center justify-center font-black text-2xl">
              🍸
            </div>
            <span className="px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 text-[10px] font-black uppercase tracking-wider border border-emerald-500/20">
              Acceso Restringido al Personal
            </span>
            <h2 className="text-2xl font-black text-slate-900 dark:text-white mt-2">
              {brandName}
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400 font-medium mt-0.5">
              Inicia sesión como Administrador o Mesero
            </p>
          </div>

          {errorMsg && (
            <div className="mb-6 p-3 rounded-2xl bg-rose-500/10 border border-rose-500/20 text-rose-600 dark:text-rose-400 text-xs flex items-center gap-2 font-medium">
              <ShieldAlert className="w-4 h-4 shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4 text-xs">
            <div>
              <label className="block text-slate-700 dark:text-slate-300 font-bold mb-1.5">Correo Electrónico</label>
              <div className="relative">
                <Mail className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="email"
                  required
                  placeholder="admin@empresa.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-2xl pl-10 pr-4 py-3 text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:border-emerald-500/50"
                />
              </div>
            </div>

            <div>
              <label className="block text-slate-700 dark:text-slate-300 font-bold mb-1.5">Contraseña</label>
              <div className="relative">
                <Lock className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="password"
                  required
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-2xl pl-10 pr-4 py-3 text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:border-emerald-500/50"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full py-3.5 rounded-2xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black text-sm transition-all shadow-md shadow-emerald-500/20 disabled:opacity-50 flex items-center justify-center gap-2 mt-6"
            >
              <LogIn className="w-4 h-4" />
              <span>{isSubmitting ? 'Iniciando Sesión...' : 'Ingresar al Sistema'}</span>
            </button>
          </form>

        </div>
      </div>
    </div>
  );
}
