import React, { useState, useEffect } from 'react';
import { Users, UserPlus, Shield, UserCheck, Mail, Lock, User, RefreshCw, CheckCircle2, ShieldAlert } from 'lucide-react';
import { supabase, isSupabaseConfigured } from '../lib/supabase';
import { useAuth } from '../context/AuthContext';

export function UsuariosView() {
  const { profile: currentProfile } = useAuth();
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
        const { data, error } = await supabase
          .from('perfiles')
          .select('*')
          .order('created_at', { ascending: false });

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
      { id: 'u1', nombre: 'Cajero Principal', email: 'admin@agogo.com', rol: 'admin', created_at: new Date().toISOString() },
      { id: 'u2', nombre: 'Carlos Mesero', email: 'mesero@agogo.com', rol: 'empleado', created_at: new Date().toISOString() }
    ]);
  };

  useEffect(() => {
    loadUsers();
  }, []);

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
        // Registrar usuario en Supabase Auth con metadata de nombre y rol
        const { data, error: authError } = await supabase.auth.signUp({
          email,
          password,
          options: {
            data: {
              nombre,
              rol
            }
          }
        });

        if (authError) throw authError;

        if (data.user) {
          // Asegurar inserción en tabla perfiles por si el trigger no ejecutó
          await supabase.from('perfiles').upsert({
            id: data.user.id,
            email,
            nombre,
            rol
          });

          setSuccessMsg(`¡Usuario ${nombre} (${rol.toUpperCase()}) creado exitosamente en Supabase!`);
          setEmail('');
          setPassword('');
          setNombre('');
          setRol('empleado');
          loadUsers();
          return;
        }
      }

      // Fallback local
      const newUser = {
        id: 'u-' + Date.now(),
        email,
        nombre,
        rol,
        created_at: new Date().toISOString()
      };
      setUsuarios(prev => [newUser, ...prev]);
      setSuccessMsg(`¡Usuario ${nombre} (${rol.toUpperCase()}) creado exitosamente!`);
      setEmail('');
      setPassword('');
      setNombre('');
    } catch (err) {
      console.error('Error al crear usuario:', err);
      setErrorMsg(err.message || 'Error al registrar el nuevo usuario.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCambiarRol = async (userId, nuevoRol) => {
    try {
      if (isSupabaseConfigured && supabase) {
        const { error } = await supabase
          .from('perfiles')
          .update({ rol: nuevoRol, updated_at: new Date().toISOString() })
          .eq('id', userId);

        if (error) {
          console.error('❌ Error al cambiar rol de usuario:', error);
          alert(`⚠️ Error al actualizar rol en Supabase: ${error.message}`);
          return;
        }
      }

      setUsuarios(prev =>
        prev.map(u => (u.id === userId ? { ...u, rol: nuevoRol } : u))
      );
    } catch (err) {
      console.error('Excepción al cambiar rol:', err);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 pb-20">
      
      {/* HEADER */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8 bg-slate-900/90 border border-slate-800 p-6 rounded-3xl backdrop-blur-md">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-pink-500 to-purple-600 text-white flex items-center justify-center font-black text-xl shadow-lg shrink-0">
            <Users className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-2xl font-extrabold text-white">Gestión de Usuarios & Personal</h1>
            <p className="text-xs text-slate-400 mt-0.5">
              Crea nuevos accesos para empleados (meseros) y administradores (cajeros) del resto-bar.
            </p>
          </div>
        </div>

        <button
          onClick={loadUsers}
          className="p-2.5 rounded-2xl bg-slate-800 text-slate-300 hover:text-white border border-slate-700 transition-colors self-start md:self-auto"
          title="Refrescar lista"
        >
          <RefreshCw className="w-4 h-4" />
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* COLUMNA 1: FORMULARIO CREAR USUARIO */}
        <div className="lg:col-span-1 bg-slate-900/70 border border-slate-800 rounded-3xl p-6 h-fit">
          <div className="flex items-center gap-2 pb-4 mb-4 border-b border-slate-800">
            <UserPlus className="w-5 h-5 text-emerald-400" />
            <h3 className="font-extrabold text-white text-base">Crear Nuevo Usuario</h3>
          </div>

          {errorMsg && (
            <div className="mb-4 p-3 rounded-2xl bg-rose-500/10 border border-rose-500/30 text-xs text-rose-300 flex items-center gap-2">
              <ShieldAlert className="w-4 h-4 text-rose-400 shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          {successMsg && (
            <div className="mb-4 p-3 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-xs text-emerald-300 flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
              <span>{successMsg}</span>
            </div>
          )}

          <form onSubmit={handleCreateUser} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-slate-300 mb-1">Nombre Completo:</label>
              <div className="relative">
                <User className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={nombre}
                  onChange={(e) => setNombre(e.target.value)}
                  placeholder="Ej: Juan Pérez"
                  className="w-full bg-slate-950 border border-slate-800 focus:border-emerald-400 rounded-2xl pl-10 pr-4 py-2.5 text-xs text-white outline-none"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-300 mb-1">Correo Electrónico:</label>
              <div className="relative">
                <Mail className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="juan@agogo.com"
                  className="w-full bg-slate-950 border border-slate-800 focus:border-emerald-400 rounded-2xl pl-10 pr-4 py-2.5 text-xs text-white outline-none"
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
                  placeholder="Mínimo 6 caracteres"
                  className="w-full bg-slate-950 border border-slate-800 focus:border-emerald-400 rounded-2xl pl-10 pr-4 py-2.5 text-xs text-white outline-none"
                  required
                  minLength={6}
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-300 mb-1">Rol de Acceso:</label>
              <select
                value={rol}
                onChange={(e) => setRol(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 text-white font-bold text-xs p-3 rounded-2xl outline-none"
              >
                <option value="empleado">🧑‍🍳 Empleado (Mesero - Toma de Pedidos)</option>
                <option value="admin">⭐ Administrador (Cajero - Cobro & Gestión)</option>
              </select>
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full py-3 bg-gradient-to-r from-emerald-400 via-cyan-400 to-teal-400 text-slate-950 font-black rounded-2xl text-xs transition-all shadow-lg active:scale-95 disabled:opacity-50 flex items-center justify-center gap-2 mt-2"
            >
              <UserPlus className="w-4 h-4" />
              <span>{isSubmitting ? 'Registrando...' : 'Crear Usuario'}</span>
            </button>
          </form>
        </div>

        {/* COLUMNA 2 Y 3: LISTA DE USUARIOS REGISTRADOS */}
        <div className="lg:col-span-2 bg-slate-900/70 border border-slate-800 rounded-3xl p-6">
          <div className="flex items-center justify-between pb-4 mb-4 border-b border-slate-800">
            <h3 className="font-extrabold text-white text-base">Personal Registrado</h3>
            <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-purple-500/20 text-purple-300 border border-purple-500/30">
              {usuarios.length} Usuarios Activos
            </span>
          </div>

          {loading ? (
            <div className="py-12 text-center text-slate-500 text-xs">Cargando personal...</div>
          ) : (
            <div className="space-y-3">
              {usuarios.map(u => (
                <div 
                  key={u.id}
                  className="p-4 rounded-2xl bg-slate-950 border border-slate-800 flex items-center justify-between gap-4"
                >
                  <div className="flex items-center gap-3">
                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center font-bold text-lg ${
                      u.rol === 'admin' ? 'bg-pink-500/20 text-pink-400 border border-pink-500/30' : 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                    }`}>
                      {u.rol === 'admin' ? '⭐' : '🧑‍🍳'}
                    </div>
                    <div>
                      <h4 className="text-sm font-extrabold text-white">{u.nombre || 'Usuario'}</h4>
                      <p className="text-xs text-slate-400 font-mono mt-0.5">{u.email}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <select
                      value={u.rol}
                      onChange={(e) => handleCambiarRol(u.id, e.target.value)}
                      className={`text-xs font-black uppercase tracking-wider px-3 py-1.5 rounded-xl border outline-none cursor-pointer transition-all ${
                        u.rol === 'admin'
                          ? 'bg-pink-500/20 text-pink-300 border-pink-500/40 focus:border-pink-400'
                          : 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40 focus:border-emerald-400'
                      }`}
                    >
                      <option value="admin" className="bg-slate-900 text-pink-300">⭐ Administrador</option>
                      <option value="empleado" className="bg-slate-900 text-emerald-300">🧑‍🍳 Empleado (Mesero)</option>
                    </select>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

      </div>

    </div>
  );
}
