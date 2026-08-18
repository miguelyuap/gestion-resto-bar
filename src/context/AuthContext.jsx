import React, { createContext, useContext, useState, useEffect } from 'react';
import { supabase, isSupabaseConfigured } from '../lib/supabase';

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);

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
      email: userEmail,
      nombre: userEmail?.split('@')[0] || 'Usuario',
      rol: defaultRole
    };
    setProfile(mockProfile);
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
    const mockProf = { id: mockUser.id, email, nombre: email.split('@')[0], rol: role };
    setUser(mockUser);
    setProfile(mockProf);
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
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        profile,
        role: profile?.rol || null,
        loading,
        login,
        logout,
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
