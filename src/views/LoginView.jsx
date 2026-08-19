import React, { useState } from 'react';
import { Lock, Mail, ShieldAlert, LogIn } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export function LoginView({ onLoginSuccess }) {
  const { login } = useAuth();
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

  return (
    <div className="min-h-[80vh] flex items-center justify-center p-4">
      <div className="w-full max-w-md bg-[#080c14] border border-emerald-500/30 rounded-3xl p-8 shadow-2xl glow-emerald relative overflow-hidden">
        
        {/* Glow de Fondo */}
        <div className="absolute -top-10 -left-10 w-40 h-40 bg-emerald-500/10 rounded-full blur-3xl" />
        <div className="absolute -bottom-10 -right-10 w-40 h-40 bg-pink-500/10 rounded-full blur-3xl" />

        <div className="relative z-10">
          
          {/* Header Marca */}
          <div className="text-center mb-8">
            <div className="w-14 h-14 mx-auto mb-3 rounded-2xl bg-gradient-to-tr from-emerald-500 via-cyan-400 to-pink-500 p-0.5 shadow-lg shadow-emerald-500/20 flex items-center justify-center">
              <div className="w-full h-full bg-[#080c14] rounded-[14px] flex items-center justify-center text-2xl">
                🍹
              </div>
            </div>
            <span className="px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-300 text-[10px] font-black uppercase tracking-wider border border-emerald-500/30">
              Acceso Restringido al Personal
            </span>
            <h2 className="text-2xl font-black text-white mt-2">
              Alo Mas Agogo
            </h2>
            <p className="text-xs text-slate-400 font-medium mt-0.5">
              Inicia sesión como Administrador o Mesero
            </p>
          </div>

          {/* Mensaje de Error */}
          {errorMsg && (
            <div className="mb-6 p-3 rounded-2xl bg-rose-500/10 border border-rose-500/30 text-xs text-rose-300 flex items-center gap-2">
              <ShieldAlert className="w-4 h-4 text-rose-400 shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          {/* Formulario Login */}
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-slate-300 mb-1">Correo Electrónico:</label>
              <div className="relative">
                <Mail className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="usuario@agogo.com"
                  className="w-full bg-slate-900 border border-slate-800 focus:border-emerald-400 rounded-2xl pl-10 pr-4 py-3 text-xs text-white placeholder-slate-500 outline-none transition-all"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-300 mb-1">Contraseña:</label>
              <div className="relative">
                <Lock className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full bg-slate-900 border border-slate-800 focus:border-emerald-400 rounded-2xl pl-10 pr-4 py-3 text-xs text-white placeholder-slate-500 outline-none transition-all"
                  required
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full py-3.5 bg-gradient-to-r from-emerald-400 via-cyan-400 to-teal-400 text-slate-950 font-black rounded-2xl text-xs sm:text-sm flex items-center justify-center gap-2 transition-all shadow-lg active:scale-95 disabled:opacity-50 mt-2"
            >
              <LogIn className="w-4 h-4" />
              <span>{isSubmitting ? 'Verificando...' : 'Iniciar Sesión'}</span>
            </button>
          </form>

        </div>

      </div>
    </div>
  );
}
