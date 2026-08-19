import React, { useState, useEffect } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import { ProtectedRoute } from './components/ProtectedRoute';
import { Navbar } from './components/Navbar';
import { ClientMenuView } from './views/ClientMenuView';
import { MeseroView } from './views/MeseroView';
import { CajaView } from './views/CajaView';
import { MesasQrView } from './views/MesasQrView';
import { UsuariosView } from './views/UsuariosView';

function AppContent() {
  const { profile } = useAuth();
  const [activeTab, setActiveTab] = useState('mesero');
  const [currentMesaNum, setCurrentMesaNum] = useState(null);
  const [isQRClient, setIsQRClient] = useState(false);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const mesaParam = params.get('mesa');
    
    // Si se accedió por código QR (?mesa=X), es un cliente y la vista es 100% informativa
    if (mesaParam) {
      setCurrentMesaNum(parseInt(mesaParam));
      setIsQRClient(true);
      setActiveTab('client_qr');
      return;
    }

    // Ajustar tab inicial por defecto según el rol del usuario
    if (profile?.rol === 'admin') {
      setActiveTab('caja');
    } else {
      setActiveTab('mesero');
    }
  }, [profile]);

  // Redirección posterior al inicio de sesión basada en el rol del usuario
  const handleRoleRedirect = (userProfile, targetTab = null) => {
    if (targetTab) {
      setActiveTab(targetTab);
      return;
    }

    if (userProfile?.rol === 'admin') {
      setActiveTab('caja'); // Redirigir a Caja si es Administrador
    } else {
      setActiveTab('mesero'); // Redirigir a Toma de Pedidos si es Empleado
    }
  };

  return (
    <div className="min-h-screen bg-[#080c14] text-slate-100 flex flex-col font-sans">
      <Navbar 
        activeTab={activeTab} 
        setActiveTab={setActiveTab} 
        currentMesaNum={currentMesaNum}
        isQRClient={isQRClient}
      />

      <main className="flex-1">
        {/* Vista 100% Informativa de Carta Digital para el Cliente QR */}
        {(isQRClient || activeTab === 'menu') && (
          <ClientMenuView mesaNum={currentMesaNum} />
        )}

        {/* Vista de Toma de Pedidos (Exclusiva para 'empleado') */}
        {!isQRClient && activeTab === 'mesero' && (
          <ProtectedRoute allowedRoles={['empleado']} onRedirect={handleRoleRedirect}>
            <MeseroView />
          </ProtectedRoute>
        )}

        {/* Vista del Dashboard de Caja & Cocina (Exclusiva para 'admin') */}
        {!isQRClient && activeTab === 'caja' && (
          <ProtectedRoute allowedRoles={['admin']} onRedirect={handleRoleRedirect}>
            <CajaView />
          </ProtectedRoute>
        )}

        {/* Vista de Gestión de Usuarios y Personal (Exclusiva para 'admin') */}
        {!isQRClient && activeTab === 'usuarios' && (
          <ProtectedRoute allowedRoles={['admin']} onRedirect={handleRoleRedirect}>
            <UsuariosView />
          </ProtectedRoute>
        )}

        {/* Vista de Administración de Códigos QR (Exclusiva para 'admin') */}
        {!isQRClient && activeTab === 'mesas' && (
          <ProtectedRoute allowedRoles={['admin']} onRedirect={handleRoleRedirect}>
            <MesasQrView />
          </ProtectedRoute>
        )}
      </main>

      <footer className="py-6 border-t border-slate-800/80 text-center text-xs text-slate-500">
        <p>Alo Mas Agogo &copy; {new Date().getFullYear()} &bull; GST-Software</p>
      </footer>
    </div>
  );
}

export function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}

export default App;
