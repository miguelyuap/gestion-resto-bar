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

const getLocalUsers = () => {
  try {
    const saved = localStorage.getItem('gst_users_db');
    return saved ? JSON.parse(saved) : {};
  } catch {
    return {};
  }
};

const saveLocalUser = (userObj) => {
  try {
    const users = getLocalUsers();
    users[userObj.email.toLowerCase()] = userObj;
    localStorage.setItem('gst_users_db', JSON.stringify(users));
  } catch (err) {
    console.error('Error guardando usuario local:', err);
  }
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
      console.warn('⚠️ No se pudo obtener el negocio de Supabase:', err);
    }
    setNegocio(DEFAULT_NEGOCIO);
    return DEFAULT_NEGOCIO;
  };

  // Cargar datos del Negocio por Slug (Enlace directo ej. 'la-taverna')
  const fetchNegocioBySlug = async (slug) => {
    if (!slug) return DEFAULT_NEGOCIO;
    const cleanSlug = slug.toLowerCase().trim();

    if (isSupabaseConfigured && supabase) {
      try {
        const { data, error } = await supabase
          .from('negocios')
          .select('*')
          .ilike('slug', cleanSlug)
          .single();

        if (!error && data) {
          setNegocio(data);
          localStorage.setItem('gst_active_tenant_slug', cleanSlug);
          return data;
        }
      } catch (err) {
        console.warn('⚠️ No se pudo encontrar el negocio por slug en Supabase:', err);
      }
    }

    // Tenant dinámico local
    const mockNegocio = {
      ...DEFAULT_NEGOCIO,
      nombre: cleanSlug.replace(/-/g, ' ').toUpperCase(),
      slug: cleanSlug
    };
    setNegocio(mockNegocio);
    localStorage.setItem('gst_active_tenant_slug', cleanSlug);
    return mockNegocio;
  };

  // Cargar perfil real desde Supabase con prioridad a la tabla perfiles / metadata
  const fetchProfile = async (userId, userEmail, userMetaRol = null) => {
    const lowerEmail = userEmail?.toLowerCase() || '';
    const localUsers = getLocalUsers();
    const savedUser = localUsers[lowerEmail];

    if (isSupabaseConfigured && supabase) {
      try {
        const { data, error } = await supabase
          .from('perfiles')
          .select('*')
          .eq('id', userId)
          .single();

        if (!error && data) {
          // Si el metadata o el registro guardado especificó rol, se valida
          const realRole = data.rol || userMetaRol || savedUser?.rol || 'cliente';
          const resolvedProfile = { ...data, rol: realRole };
          setProfile(resolvedProfile);
          if (data.negocio_id) {
            await fetchNegocio(data.negocio_id);
          }
          return resolvedProfile;
        }
      } catch (err) {
        console.warn('Error al consultar tabla perfiles en Supabase:', err);
      }
    }

    // Perfil local fallback
    const resolvedRole = userMetaRol || savedUser?.rol || (lowerEmail.includes('admin') ? 'admin' : 'cliente');
    const resolvedName = savedUser?.nombre || userEmail?.split('@')[0] || 'Usuario';

    const mockProfile = {
      id: userId,
      negocio_id: DEFAULT_NEGOCIO.id,
      email: userEmail,
      nombre: resolvedName,
      rol: resolvedRole
    };

    setProfile(mockProfile);
    setNegocio(DEFAULT_NEGOCIO);
    return mockProfile;
  };

  useEffect(() => {
    if (!isSupabaseConfigured || !supabase) {
      try {
        const savedSession = localStorage.getItem('gst_active_session');
        if (savedSession) {
          const parsed = JSON.parse(savedSession);
          setUser(parsed.user);
          setProfile(parsed.profile);
        }
      } catch (e) {
        console.error(e);
      }
      setLoading(false);
      return;
    }

    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session?.user) {
        setUser(session.user);
        const metaRol = session.user.user_metadata?.rol;
        fetchProfile(session.user.id, session.user.email, metaRol);
      }
      setLoading(false);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (session?.user) {
        setUser(session.user);
        const metaRol = session.user.user_metadata?.rol;
        await fetchProfile(session.user.id, session.user.email, metaRol);
      } else {
        setUser(null);
        setProfile(null);
        setNegocio(DEFAULT_NEGOCIO);
      }
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  // Registro en Supabase (o Local) con sincronización en tabla 'perfiles'
  const register = async ({ email, password, nombre, telefono, rol, negocio_nombre }) => {
    setLoading(true);
    const lowerEmail = email.toLowerCase();
    const assignedRole = rol || 'cliente';

    const localProfile = {
      id: 'usr-' + Date.now(),
      negocio_id: DEFAULT_NEGOCIO.id,
      email: lowerEmail,
      nombre: nombre || lowerEmail.split('@')[0],
      telefono: telefono || '',
      rol: assignedRole,
      negocio_nombre: negocio_nombre || 'GST Resto Bar'
    };

    saveLocalUser(localProfile);

    if (isSupabaseConfigured && supabase) {
      // REGISTRO REAL EN SUPABASE (SIN RETORNO SILENCIOSO SI HAY ERROR)
      const { data, error } = await supabase.auth.signUp({
        email: lowerEmail,
        password,
        options: {
          data: {
            nombre: localProfile.nombre,
            telefono: localProfile.telefono,
            rol: assignedRole
          }
        }
      });

      if (error) {
        setLoading(false);
        throw error; // Lanza error explícito de Supabase (ej. "User already registered")
      }

      if (data.user) {
        // Upsert directo en la tabla 'perfiles' de Supabase
        try {
          await supabase
            .from('perfiles')
            .upsert({
              id: data.user.id,
              email: lowerEmail,
              nombre: localProfile.nombre,
              telefono: localProfile.telefono,
              rol: assignedRole,
              negocio_id: DEFAULT_NEGOCIO.id
            });
        } catch (upsertErr) {
          console.warn('Upsert perfiles warning:', upsertErr);
        }

        setUser(data.user);
        const userProfile = { ...localProfile, id: data.user.id };
        setProfile(userProfile);
        localStorage.setItem('gst_active_session', JSON.stringify({ user: data.user, profile: userProfile }));
        setLoading(false);
        return { user: data.user, profile: userProfile };
      }
    }

    // Modo local solo si Supabase no está configurado
    const mockUser = { id: localProfile.id, email: lowerEmail };
    setUser(mockUser);
    setProfile(localProfile);
    localStorage.setItem('gst_active_session', JSON.stringify({ user: mockUser, profile: localProfile }));
    setLoading(false);
    return { user: mockUser, profile: localProfile };
  };

  // Inicio de Sesión REAL con Supabase & Validación Estricta de Rol
  const login = async (email, password, expectedType = 'negocio') => {
    setLoading(true);
    const lowerEmail = email.toLowerCase();
    const localUsers = getLocalUsers();
    const savedUser = localUsers[lowerEmail];

    let userObj = null;
    let userProf = null;

    if (isSupabaseConfigured && supabase) {
      // LOGIN REAL EN SUPABASE (LANZA ERROR SI CREDENCIALES SON INVÁLIDAS)
      const { data, error } = await supabase.auth.signInWithPassword({
        email: lowerEmail,
        password
      });

      if (error) {
        setLoading(false);
        throw error; // No silenciar errores de credenciales en Supabase
      }

      if (data.user) {
        userObj = data.user;
        const metaRol = data.user.user_metadata?.rol || savedUser?.rol;
        userProf = await fetchProfile(data.user.id, data.user.email, metaRol);
      }
    } else {
      // Modo local solo si Supabase no está configurado
      const resolvedRole = savedUser?.rol || (expectedType === 'cliente' ? 'cliente' : lowerEmail.includes('admin') ? 'admin' : 'empleado');
      userObj = { id: savedUser?.id || ('usr-mock-' + Date.now()), email: lowerEmail };
      userProf = { 
        id: userObj.id, 
        negocio_id: DEFAULT_NEGOCIO.id,
        email: lowerEmail, 
        nombre: savedUser?.nombre || lowerEmail.split('@')[0], 
        rol: resolvedRole 
      };
    }

    if (!userProf) {
      setLoading(false);
      throw new Error('No se pudo recuperar el perfil de usuario.');
    }

    // VALIDACIÓN ESTRICTA DE PESTAÑA NEGOCIO VS CLIENTE
    if (expectedType === 'negocio' && userProf.rol === 'cliente') {
      setLoading(false);
      throw new Error('Esta cuenta está registrada como Cliente. Por favor inicia sesión en la pestaña "Soy Cliente".');
    }

    if (expectedType === 'cliente' && (userProf.rol === 'admin' || userProf.rol === 'empleado')) {
      setLoading(false);
      throw new Error(`Esta cuenta está registrada como Personal del Negocio (${userProf.rol.toUpperCase()}). Por favor inicia sesión en la pestaña "Soy Negocio".`);
    }

    setUser(userObj);
    setProfile(userProf);
    localStorage.setItem('gst_active_session', JSON.stringify({ user: userObj, profile: userProf }));
    setLoading(false);
    return { user: userObj, profile: userProf };
  };

  // Cerrar Sesión
  const logout = async () => {
    if (isSupabaseConfigured && supabase) {
      await supabase.auth.signOut();
    }
    setUser(null);
    setProfile(null);
    setNegocio(DEFAULT_NEGOCIO);
    localStorage.removeItem('gst_active_session');
  };

  // Formateo de Moneda
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
        register,
        logout,
        fetchNegocio,
        fetchNegocioBySlug,
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
