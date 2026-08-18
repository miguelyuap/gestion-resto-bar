import React, { useState, useEffect } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import { ProtectedRoute } from './components/ProtectedRoute';
import { Navbar } from './components/Navbar';
import { ClientMenuView } from './views/ClientMenuView';
import { MeseroView } from './views/MeseroView';
import { CajaView } from './views/CajaView';
import { MesasQrView } from './views/MesasQrView';

function AppContent() {
  const { profile } = useAuth();
  const [activeTab, setActiveTab] = useState('menu');
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

    // Navegación interna por rutas
    const path = window.location.pathname;
    if (path.includes('/caja')) {
      setActiveTab('caja');
    } else if (path.includes('/mesero')) {
      setActiveTab('mesero');
    } else if (path.includes('/mesas')) {
      setActiveTab('mesas');
    } else {
      setActiveTab('mesero');
    }
  }, []);

  // Redirección posterior al inicio de sesión basada en el rol del usuario
  const handleRoleRedirect = (userProfile, targetTab = null) => {
    if (targetTab) {
      setActiveTab(targetTab);
      return;
    }

    if (userProfile?.rol === 'admin') {
      setActiveTab('caja'); // Redirigir al Dashboard de Caja si es Admin
    } else {
      setActiveTab('mesero'); // Redirigir a la vista de Toma de Pedidos si es Empleado
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

        {/* Vista de Toma de Pedidos (Permitida para 'admin' y 'empleado') */}
        {!isQRClient && activeTab === 'mesero' && (
          <ProtectedRoute allowedRoles={['admin', 'empleado']} onRedirect={handleRoleRedirect}>
            <MeseroView />
          </ProtectedRoute>
        )}

        {/* Vista del Dashboard de Caja & Cocina (Exclusiva para 'admin') */}
        {!isQRClient && activeTab === 'caja' && (
          <ProtectedRoute allowedRoles={['admin']} onRedirect={handleRoleRedirect}>
            <CajaView />
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
        <p>GRANIZADOS & FLOW &copy; {new Date().getFullYear()} &bull; A lo Más Agogo Granizados</p>
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
