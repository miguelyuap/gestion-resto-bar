import React, { createContext, useContext, useState, useEffect } from 'react';
import { supabase, isSupabaseConfigured } from '../lib/supabase';

const AuthContext = createContext();

const DEFAULT_NEGOCIO = {
  id: '00000000-0000-0000-0000-000000000001',
  nombre: 'GST Resto Bar',
  slug: 'gst-resto-bar',
  nit: '901.234.567-8',
  moneda: 'COP',
  simbolo_moneda: '$',
  logo_url: null,
  activo: true
};

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [profile, setProfile] = useState(null);
  const [negocio, setNegocio] = useState(DEFAULT_NEGOCIO);
  const [loading, setLoading] = useState(true);

  // Cargar datos del Negocio (Tenant) desde Supabase
  const fetchNegocio = async (negocioId) => {
    if (!isSupabaseConfigured || !supabase || !negocioId) {
      setNegocio(DEFAULT_NEGOCIO);
      return DEFAULT_NEGOCIO;
    }

    try {
      const { data, error } = await supabase
        .from('negocios')
        .select('*')
        .eq('id', negocioId)
        .single();

      if (!error && data) {
        setNegocio(data);
        return data;
      }
    } catch (err) {
      console.warn('⚠️ No se pudo obtener el negocio de Supabase, usando configuración predeterminada:', err);
    }
    setNegocio(DEFAULT_NEGOCIO);
    return DEFAULT_NEGOCIO;
  };

  // Cargar perfil desde la tabla 'perfiles' de Supabase
  const fetchProfile = async (userId, userEmail) => {
    if (isSupabaseConfigured && supabase) {
      try {
        const { data, error } = await supabase
          .from('perfiles')
          .select('*')
          .eq('id', userId)
          .single();

        if (!error && data) {
          setProfile(data);
          if (data.negocio_id) {
            await fetchNegocio(data.negocio_id);
          }
          return data;
        }
      } catch (err) {
        console.warn('Error al obtener perfil de Supabase:', err);
      }
    }

    // Perfil de respaldo si la tabla perfiles aún no tiene la fila
    const defaultRole = userEmail?.includes('admin') ? 'admin' : 'empleado';
    const mockProfile = {
      id: userId,
      negocio_id: DEFAULT_NEGOCIO.id,
      email: userEmail,
      nombre: userEmail?.split('@')[0] || 'Usuario',
      rol: defaultRole
    };
    setProfile(mockProfile);
    setNegocio(DEFAULT_NEGOCIO);
    return mockProfile;
  };

  useEffect(() => {
    if (!isSupabaseConfigured || !supabase) {
      setLoading(false);
      return;
    }

    // Comprobar sesión actual al cargar
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session?.user) {
        setUser(session.user);
        fetchProfile(session.user.id, session.user.email);
      }
      setLoading(false);
    });

    // Escuchar cambios de estado en Supabase Auth
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (session?.user) {
        setUser(session.user);
        await fetchProfile(session.user.id, session.user.email);
      } else {
        setUser(null);
        setProfile(null);
        setNegocio(DEFAULT_NEGOCIO);
      }
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  // Iniciar Sesión con Email y Contraseña
  const login = async (email, password) => {
    setLoading(true);
    if (isSupabaseConfigured && supabase) {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password
      });

      if (error) {
        setLoading(false);
        throw error;
      }

      if (data.user) {
        setUser(data.user);
        const userProfile = await fetchProfile(data.user.id, data.user.email);
        setLoading(false);
        return { user: data.user, profile: userProfile };
      }
    }

    // Login Simulado en modo local/pruebas
    const role = email.includes('admin') ? 'admin' : 'empleado';
    const mockUser = { id: 'usr-mock-' + Date.now(), email };
    const mockProf = { 
      id: mockUser.id, 
      negocio_id: DEFAULT_NEGOCIO.id,
      email, 
      nombre: email.split('@')[0], 
      rol: role 
    };
    setUser(mockUser);
    setProfile(mockProf);
    setNegocio(DEFAULT_NEGOCIO);
    setLoading(false);
    return { user: mockUser, profile: mockProf };
  };

  // Cerrar Sesión
  const logout = async () => {
    if (isSupabaseConfigured && supabase) {
      await supabase.auth.signOut();
    }
    setUser(null);
    setProfile(null);
    setNegocio(DEFAULT_NEGOCIO);
  };

  // Helper de Formateo de Moneda Dinámico según el Tenant
  const formatCurrency = (val) => {
    const num = Number(val) || 0;
    const symbol = negocio?.simbolo_moneda || '$';
    return `${symbol} ${num.toLocaleString('es-CO')}`;
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        profile,
        negocio,
        role: profile?.rol || null,
        loading,
        login,
        logout,
        formatCurrency,
        isSupabaseConfigured
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
