import React, { useState, useEffect } from 'react';
import { Navbar } from './components/Navbar';
import { ClientMenuView } from './views/ClientMenuView';
import { MeseroView } from './views/MeseroView';
import { CajaView } from './views/CajaView';
import { MesasQrView } from './views/MesasQrView';

export function App() {
  const [activeTab, setActiveTab] = useState('menu');
  const [currentMesaNum, setCurrentMesaNum] = useState(null);
  const [isQRClient, setIsQRClient] = useState(false);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const mesaParam = params.get('mesa');
    
    // Si el usuario escaneó el código QR (?mesa=X), es un cliente y se fuerza la vista informativa pura
    if (mesaParam) {
      setCurrentMesaNum(parseInt(mesaParam));
      setIsQRClient(true);
      setActiveTab('client_qr');
      return;
    }

    // Rutas internas del personal del bar
    const path = window.location.pathname;
    if (path.includes('/caja')) {
      setActiveTab('caja');
    } else if (path.includes('/mesero')) {
      setActiveTab('mesero');
    } else if (path.includes('/mesas')) {
      setActiveTab('mesas');
    } else {
      setActiveTab('mesero'); // Por defecto para el personal abre en Modo Mesero
    }
  }, []);

  return (
    <div className="min-h-screen bg-[#080c14] text-slate-100 flex flex-col font-sans">
      <Navbar 
        activeTab={activeTab} 
        setActiveTab={setActiveTab} 
        currentMesaNum={currentMesaNum}
        isQRClient={isQRClient}
      />

      <main className="flex-1">
        {/* Vista 100% de Lectura e Informativa para el Cliente que escaneó el QR */}
        {(isQRClient || activeTab === 'menu') && (
          <ClientMenuView mesaNum={currentMesaNum} />
        )}

        {/* Módulo Privado de Toma de Pedidos exclusivo para Meseros */}
        {!isQRClient && activeTab === 'mesero' && (
          <MeseroView />
        )}

        {/* Pantalla de Caja & Cocina en Tiempo Real */}
        {!isQRClient && activeTab === 'caja' && (
          <CajaView />
        )}

        {/* Administración de Códigos QR por Mesa */}
        {!isQRClient && activeTab === 'mesas' && (
          <MesasQrView />
        )}
      </main>

      <footer className="py-6 border-t border-slate-800/80 text-center text-xs text-slate-500">
        <p>GRANIZADOS & FLOW &copy; {new Date().getFullYear()} &bull; A lo Más Agogo Granizados</p>
      </footer>
    </div>
  );
}

export default App;
