import React, { useState, useEffect } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import { ThemeProvider, useTheme } from './context/ThemeContext';
import { ProtectedRoute } from './components/ProtectedRoute';
import { Navbar } from './components/Navbar';
import { ClientMenuView } from './views/ClientMenuView';
import { MeseroView } from './views/MeseroView';
import { CajaView } from './views/CajaView';
import { MesasQrView } from './views/MesasQrView';
import { UsuariosView } from './views/UsuariosView';
import { ProductosAdminView } from './views/ProductosAdminView';
import { ReportesVentasView } from './views/ReportesVentasView';
import { BrandingAdminView } from './views/BrandingAdminView';

function AppContent() {
  const { profile, negocio, fetchNegocioBySlug } = useAuth();
  const [activeTab, setActiveTab] = useState('mesero');
  const [currentMesaNum, setCurrentMesaNum] = useState(null);
  const [isQRClient, setIsQRClient] = useState(false);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const mesaParam = params.get('mesa');
    const negocioSlug = params.get('negocio') || params.get('tenant') || params.get('slug');

    if (negocioSlug && fetchNegocioBySlug) {
      fetchNegocioBySlug(negocioSlug);
    }
    
    if (mesaParam) {
      setCurrentMesaNum(parseInt(mesaParam));
      setIsQRClient(true);
      setActiveTab('client_qr');
      return;
    }

    if (profile?.rol === 'admin') {
      setActiveTab('caja');
    } else if (profile?.rol === 'cliente') {
      setActiveTab('menu');
    } else {
      setActiveTab('mesero');
    }
  }, [profile]);

  const handleRoleRedirect = (userProfile, targetTab = null) => {
    if (targetTab) {
      setActiveTab(targetTab);
      return;
    }

    if (userProfile?.rol === 'admin') {
      setActiveTab('caja');
    } else if (userProfile?.rol === 'cliente') {
      setActiveTab('menu');
    } else {
      setActiveTab('mesero');
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 flex flex-col font-sans transition-colors duration-200">
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

        {/* Módulo de Reportes de Ventas por Fechas (Exclusivo para 'admin') */}
        {!isQRClient && activeTab === 'reportes' && (
          <ProtectedRoute allowedRoles={['admin']} onRedirect={handleRoleRedirect}>
            <ReportesVentasView />
          </ProtectedRoute>
        )}

        {/* Vista de Gestión de Productos y Categorías (Exclusiva para 'admin') */}
        {!isQRClient && activeTab === 'productos' && (
          <ProtectedRoute allowedRoles={['admin']} onRedirect={handleRoleRedirect}>
            <ProductosAdminView />
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

        {/* Studio de Personalización de Marca & Promociones (Exclusiva para 'admin') */}
        {!isQRClient && activeTab === 'branding' && (
          <ProtectedRoute allowedRoles={['admin']} onRedirect={handleRoleRedirect}>
            <BrandingAdminView />
          </ProtectedRoute>
        )}
      </main>

      <footer className="py-6 border-t border-slate-200 dark:border-slate-800/80 text-center text-xs text-slate-500 dark:text-slate-400 bg-white/50 dark:bg-slate-950/50 backdrop-blur-sm">
        <p>{negocio?.nombre || 'GST Resto Bar'} &copy; {new Date().getFullYear()} &bull; SaaS Multi-Tenant</p>
      </footer>
    </div>
  );
}

export function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <AppContent />
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;
