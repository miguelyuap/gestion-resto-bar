import React, { useState } from 'react';
import { Lock, Mail, ShieldAlert, LogIn, UserPlus, Building2, User, Phone, Sparkles } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export function LoginView({ onLoginSuccess }) {
  const { login, register, negocio } = useAuth();
  
  // Tabs: 'negocio' vs 'cliente'
  const [userType, setUserType] = useState('negocio'); // 'negocio' o 'cliente'
  const [isRegistering, setIsRegistering] = useState(false); // login vs registro

  // Campos de Formulario
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [businessName, setBusinessName] = useState('');
  const [role, setRole] = useState('admin');

  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg('');
    setSuccessMsg('');

    if (!email || !password) {
      setErrorMsg('Por favor ingresa tu correo y contraseña.');
      return;
    }

    try {
      setIsSubmitting(true);

      if (isRegistering) {
        // REGISTRO DUAL
        const payload = {
          email,
          password,
          nombre: name || email.split('@')[0],
          telefono: phone,
          rol: userType === 'cliente' ? 'cliente' : role,
          negocio_nombre: userType === 'negocio' ? (businessName || 'Nuevo RestoBar') : negocio?.nombre
        };

        const res = await register(payload);
        setSuccessMsg('¡Cuenta creada con éxito! Iniciando sesión...');
        setTimeout(() => {
          if (onLoginSuccess) onLoginSuccess(res.profile);
        }, 1000);
      } else {
        // INICIO DE SESIÓN
        const res = await login(email, password, userType);
        if (onLoginSuccess) {
          onLoginSuccess(res.profile);
        }
      }
    } catch (err) {
      console.error('Error en autenticación:', err);
      setErrorMsg(err.message || 'Credenciales inválidas. Revisa tu correo y contraseña.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const brandName = negocio?.nombre || 'GST Resto Bar';

  return (
    <div className="min-h-[85vh] flex items-center justify-center p-4">
      <div className="w-full max-w-md bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 sm:p-8 shadow-2xl relative overflow-hidden transition-colors duration-200 space-y-6">
        
        {/* HEADER MARCA */}
        <div className="text-center space-y-2">
          <div className="w-14 h-14 mx-auto rounded-2xl bg-amber-500 text-slate-950 p-0.5 shadow-lg shadow-amber-500/20 flex items-center justify-center font-black text-2xl">
            🍸
          </div>
          <h2 className="text-2xl font-black text-slate-900 dark:text-white">{brandName}</h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">
            Plataforma POS & Sistema de Pedidos a Domicilio
          </p>
        </div>

        {/* SELECTOR DUAL DE TIPO DE USUARIO: NEGOCIO VS CLIENTE */}
        <div className="grid grid-cols-2 gap-2 p-1.5 bg-slate-100 dark:bg-slate-950 rounded-2xl border border-slate-200 dark:border-slate-800">
          <button
            type="button"
            onClick={() => {
              setUserType('negocio');
              setErrorMsg('');
            }}
            className={`py-2.5 rounded-xl text-xs font-black flex items-center justify-center gap-2 transition-all ${
              userType === 'negocio'
                ? 'bg-amber-500 text-slate-950 shadow-md'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <Building2 className="w-4 h-4" />
            <span>Soy Negocio</span>
          </button>

          <button
            type="button"
            onClick={() => {
              setUserType('cliente');
              setErrorMsg('');
            }}
            className={`py-2.5 rounded-xl text-xs font-black flex items-center justify-center gap-2 transition-all ${
              userType === 'cliente'
                ? 'bg-amber-500 text-slate-950 shadow-md'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <User className="w-4 h-4" />
            <span>Soy Cliente</span>
          </button>
        </div>

        {/* MODO LOGIN VS REGISTRO SWITCH */}
        <div className="flex justify-between items-center text-xs pb-1 border-b border-slate-100 dark:border-slate-800">
          <span className="font-bold text-slate-800 dark:text-slate-200 uppercase tracking-wider text-[10px]">
            {userType === 'negocio' ? 'Acceso Administrativo / Staff' : 'Acceso Compras & Domicilio'}
          </span>
          <button
            type="button"
            onClick={() => {
              setIsRegistering(!isRegistering);
              setErrorMsg('');
            }}
            className="text-amber-500 hover:underline font-bold text-xs"
          >
            {isRegistering ? '¿Ya tienes cuenta? Inicia Sesión' : '¿No tienes cuenta? Regístrate'}
          </button>
        </div>

        {errorMsg && (
          <div className="p-3 rounded-2xl bg-rose-500/10 border border-rose-500/20 text-rose-600 dark:text-rose-400 text-xs flex items-center gap-2 font-medium">
            <ShieldAlert className="w-4 h-4 shrink-0" />
            <span>{errorMsg}</span>
          </div>
        )}

        {successMsg && (
          <div className="p-3 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 dark:text-emerald-400 text-xs font-bold text-center">
            {successMsg}
          </div>
        )}

        {/* FORMULARIO ADAPTABLE */}
        <form onSubmit={handleSubmit} className="space-y-4 text-xs">
          
          {/* CAMPOS ADICIONALES PARA REGISTRO */}
          {isRegistering && (
            <>
              {userType === 'negocio' && (
                <div>
                  <label className="block text-slate-700 dark:text-slate-300 font-bold mb-1">Nombre del RestoBar / Negocio</label>
                  <input
                    type="text"
                    required
                    placeholder="Ej. La Taverna Gastrobar"
                    value={businessName}
                    onChange={(e) => setBusinessName(e.target.value)}
                    className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-2xl px-4 py-2.5 text-slate-900 dark:text-white font-medium focus:border-amber-500 outline-none"
                  />
                </div>
              )}

              <div>
                <label className="block text-slate-700 dark:text-slate-300 font-bold mb-1">Nombre Completo</label>
                <input
                  type="text"
                  required
                  placeholder="Ej. Juan Pérez"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-2xl px-4 py-2.5 text-slate-900 dark:text-white font-medium focus:border-amber-500 outline-none"
                />
              </div>

              {userType === 'cliente' && (
                <div>
                  <label className="block text-slate-700 dark:text-slate-300 font-bold mb-1">Teléfono / WhatsApp</label>
                  <div className="relative">
                    <Phone className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                    <input
                      type="tel"
                      required
                      placeholder="300 123 4567"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-2xl pl-10 pr-4 py-2.5 text-slate-900 dark:text-white font-medium focus:border-amber-500 outline-none"
                    />
                  </div>
                </div>
              )}

              {userType === 'negocio' && (
                <div>
                  <label className="block text-slate-700 dark:text-slate-300 font-bold mb-1">Rol en el Negocio</label>
                  <select
                    value={role}
                    onChange={(e) => setRole(e.target.value)}
                    className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-2xl px-4 py-2.5 text-slate-900 dark:text-white font-medium focus:border-amber-500 outline-none"
                  >
                    <option value="admin">Administrador (Control Total)</option>
                    <option value="empleado">Empleado / Mesero (Modo POS)</option>
                  </select>
                </div>
              )}
            </>
          )}

          <div>
            <label className="block text-slate-700 dark:text-slate-300 font-bold mb-1">Correo Electrónico</label>
            <div className="relative">
              <Mail className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="email"
                required
                placeholder={userType === 'negocio' ? 'admin@restobar.com' : 'cliente@gmail.com'}
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-2xl pl-10 pr-4 py-2.5 text-slate-900 dark:text-white placeholder-slate-400 focus:border-amber-500 outline-none"
              />
            </div>
          </div>

          <div>
            <label className="block text-slate-700 dark:text-slate-300 font-bold mb-1">Contraseña</label>
            <div className="relative">
              <Lock className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="password"
                required
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-2xl pl-10 pr-4 py-2.5 text-slate-900 dark:text-white placeholder-slate-400 focus:border-amber-500 outline-none"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full py-3.5 rounded-2xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-sm transition-all shadow-lg shadow-amber-500/20 disabled:opacity-50 flex items-center justify-center gap-2 mt-6"
          >
            {isRegistering ? <UserPlus className="w-4 h-4" /> : <LogIn className="w-4 h-4" />}
            <span>
              {isSubmitting
                ? 'Procesando...'
                : isRegistering
                ? `Registrarme como ${userType === 'negocio' ? 'Negocio' : 'Cliente'}`
                : `Ingresar como ${userType === 'negocio' ? 'Negocio' : 'Cliente'}`}
            </span>
          </button>
        </form>

      </div>
    </div>
  );
}

export default LoginView;
