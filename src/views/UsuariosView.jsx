import React, { useState, useEffect } from 'react';
import { Users, UserPlus, Shield, UserCheck, Mail, Lock, User, RefreshCw, CheckCircle2, ShieldAlert } from 'lucide-react';
import { supabase, isSupabaseConfigured } from '../lib/supabase';
import { useAuth } from '../context/AuthContext';

export function UsuariosView() {
  const { profile: currentProfile, negocio } = useAuth();
  const [usuarios, setUsuarios] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // Formulario Nuevo Usuario
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [nombre, setNombre] = useState('');
  const [rol, setRol] = useState('empleado');
  
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  // Cargar lista de usuarios desde la tabla perfiles
  const loadUsers = async () => {
    try {
      setLoading(true);
      if (isSupabaseConfigured && supabase) {
        let query = supabase
          .from('perfiles')
          .select('*')
          .order('created_at', { ascending: false });

        if (negocio?.id) {
          query = query.eq('negocio_id', negocio.id);
        }

        const { data, error } = await query;

        if (!error && data) {
          setUsuarios(data);
          return;
        }
      }
    } catch (err) {
      console.error('Error cargando usuarios:', err);
    } finally {
      setLoading(false);
    }

    // Fallback de demostración
    setUsuarios([
      { id: 'u1', nombre: 'Administrador POS', email: 'admin@gst.com', rol: 'admin', created_at: new Date().toISOString() },
      { id: 'u2', nombre: 'Mesero Turno 1', email: 'mesero@gst.com', rol: 'empleado', created_at: new Date().toISOString() }
    ]);
  };

  useEffect(() => {
    loadUsers();
  }, [negocio]);

  // Crear Nuevo Usuario (Empleado o Admin)
  const handleCreateUser = async (e) => {
    e.preventDefault();
    if (!email || !password || !nombre) {
      setErrorMsg('Por favor completa todos los campos del formulario.');
      return;
    }

    try {
      setIsSubmitting(true);
      setErrorMsg('');
      setSuccessMsg('');

      if (isSupabaseConfigured && supabase) {
        const { data, error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            data: {
              nombre,
              rol,
              negocio_id: negocio?.id
            }
          }
        });

        if (error) throw error;
      }

      setSuccessMsg(`Usuario ${nombre} (${rol}) creado exitosamente.`);
      setEmail('');
      setPassword('');
      setNombre('');
      setRol('empleado');
      loadUsers();
    } catch (err) {
      console.error('Error al crear usuario:', err);
      setErrorMsg(err.message || 'Ocurrió un error al registrar el usuario.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 pb-20">
      
      {/* HEADER GESTIÓN DE PERSONAL */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 rounded-2xl shadow-sm transition-colors duration-200">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-emerald-500 text-slate-950 flex items-center justify-center font-black text-xl shrink-0 shadow-sm">
            👥
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl sm:text-2xl font-extrabold text-slate-900 dark:text-white">Gestión de Personal</h1>
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              {negocio?.nombre || 'GST Resto Bar'} &bull; Administra usuarios y roles (Admin / Empleado)
            </p>
          </div>
        </div>

        <button
          onClick={loadUsers}
          className="p-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white border border-slate-200 dark:border-slate-700 transition-colors self-start md:self-auto"
        >
          <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
        
        {/* COLUMNA FORMULARIO DE REGISTRO */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-sm">
          <div className="flex items-center gap-2 pb-4 border-b border-slate-100 dark:border-slate-800 mb-4">
            <UserPlus className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
            <h2 className="font-extrabold text-base text-slate-900 dark:text-white">Crear Nuevo Usuario</h2>
          </div>

          {successMsg && (
            <div className="mb-4 p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 dark:text-emerald-400 text-xs flex items-center gap-2 font-medium">
              <CheckCircle2 className="w-4 h-4 shrink-0" />
              <span>{successMsg}</span>
            </div>
          )}

          {errorMsg && (
            <div className="mb-4 p-3 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-600 dark:text-rose-400 text-xs flex items-center gap-2 font-medium">
              <ShieldAlert className="w-4 h-4 shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          <form onSubmit={handleCreateUser} className="space-y-4 text-xs">
            <div>
              <label className="block text-slate-600 dark:text-slate-400 font-bold mb-1">Nombre Completo</label>
              <div className="relative">
                <User className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="text"
                  required
                  placeholder="Ej. Carlos Mesero"
                  value={nombre}
                  onChange={(e) => setNombre(e.target.value)}
                  className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl pl-9 pr-3 py-2.5 text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:border-emerald-500/50"
                />
              </div>
            </div>

            <div>
              <label className="block text-slate-600 dark:text-slate-400 font-bold mb-1">Correo Electrónico</label>
              <div className="relative">
                <Mail className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="email"
                  required
                  placeholder="mesero@empresa.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl pl-9 pr-3 py-2.5 text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:border-emerald-500/50"
                />
              </div>
            </div>

            <div>
              <label className="block text-slate-600 dark:text-slate-400 font-bold mb-1">Contraseña</label>
              <div className="relative">
                <Lock className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="password"
                  required
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl pl-9 pr-3 py-2.5 text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:border-emerald-500/50"
                />
              </div>
            </div>

            <div>
              <label className="block text-slate-600 dark:text-slate-400 font-bold mb-1">Rol de Acceso</label>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => setRol('empleado')}
                  className={`p-2.5 rounded-xl border text-xs font-bold transition-all ${
                    rol === 'empleado'
                      ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/40'
                      : 'bg-slate-50 dark:bg-slate-950 text-slate-600 dark:text-slate-400 border-slate-200 dark:border-slate-800'
                  }`}
                >
                  🧑‍🍳 Empleado
                </button>
                <button
                  type="button"
                  onClick={() => setRol('admin')}
                  className={`p-2.5 rounded-xl border text-xs font-bold transition-all ${
                    rol === 'admin'
                      ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/40'
                      : 'bg-slate-50 dark:bg-slate-950 text-slate-600 dark:text-slate-400 border-slate-200 dark:border-slate-800'
                  }`}
                >
                  ⭐ Admin
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full py-3 rounded-xl bg-emerald-500 text-slate-950 font-black text-xs hover:bg-emerald-400 transition-colors shadow-md shadow-emerald-500/20 disabled:opacity-50"
            >
              {isSubmitting ? 'Creando Usuario...' : 'Registrar Cuenta'}
            </button>
          </form>
        </div>

        {/* COLUMNA LISTADO DE USUARIOS REGISTRADOS */}
        <div className="lg:col-span-2 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="font-extrabold text-base text-slate-900 dark:text-white">Cuentas Registradas ({usuarios.length})</h2>
          </div>

          <div className="space-y-3">
            {usuarios.map(u => (
              <div
                key={u.id}
                className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-4 rounded-xl flex items-center justify-between shadow-sm"
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center font-bold text-slate-700 dark:text-slate-200">
                    {u.nombre ? u.nombre.charAt(0).toUpperCase() : 'U'}
                  </div>
                  <div>
                    <h3 className="font-extrabold text-sm text-slate-900 dark:text-white">{u.nombre || 'Usuario'}</h3>
                    <p className="text-xs text-slate-500 dark:text-slate-400">{u.email}</p>
                  </div>
                </div>

                <span className={`text-[10px] font-black uppercase px-2.5 py-1 rounded-full border ${
                  u.rol === 'admin'
                    ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20'
                    : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700'
                }`}>
                  {u.rol === 'admin' ? '⭐ Admin' : '🧑‍🍳 Empleado'}
                </span>
              </div>
            ))}
          </div>
        </div>

      </div>

    </div>
  );
}
