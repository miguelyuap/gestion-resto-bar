import React, { useState, useEffect } from 'react';
import { Search, Sparkles, Wine, GlassWater, Flame, Layers } from 'lucide-react';
import { apiService } from '../services/api';

export function ClientMenuView({ mesaNum }) {
  const [productos, setProductos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [categoriaSel, setCategoriaSel] = useState('todos');
  const [busqueda, setBusqueda] = useState('');
  const [selectedProduct, setSelectedProduct] = useState(null);

  useEffect(() => {
    async function loadProducts() {
      try {
        setLoading(true);
        const data = await apiService.getProductos();
        setProductos(data);
      } catch (err) {
        console.error('Error al cargar carta digital:', err);
      } finally {
        setLoading(false);
      }
    }
    loadProducts();
  }, []);

  // Filtrado de Productos
  const productosFiltrados = productos.filter(p => {
    const matchCat = categoriaSel === 'todos' || p.categoria === categoriaSel;
    const matchSearch = 
      p.nombre.toLowerCase().includes(busqueda.toLowerCase()) ||
      (p.ingredientes && p.ingredientes.toLowerCase().includes(busqueda.toLowerCase()));
    return matchCat && matchSearch;
  });

  const formatCOP = (val) => {
    return new Intl.NumberFormat('es-CO', {
      style: 'currency',
      currency: 'COP',
      maximumFractionDigits: 0
    }).format(val || 0);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 pb-20">
      
      {/* BANNER PRINCIPAL DE LA MARCA PARA EL CLIENTE */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-emerald-950/90 via-slate-950 to-pink-950/90 border border-emerald-500/30 p-6 sm:p-8 mb-6 shadow-2xl">
        <div className="absolute -right-10 -bottom-10 w-48 h-48 bg-emerald-500/10 rounded-full blur-3xl" />
        <div className="absolute -left-10 -top-10 w-48 h-48 bg-pink-500/10 rounded-full blur-3xl" />
        
        <div className="relative z-10 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-300 text-xs font-black uppercase tracking-wider border border-emerald-500/40">
                GRANIZADOS & FLOW 🍹
              </span>
              {mesaNum && (
                <span className="px-3 py-1 rounded-full bg-pink-500/20 text-pink-300 text-xs font-black uppercase tracking-wider border border-pink-500/40">
                  Mesa #{mesaNum}
                </span>
              )}
            </div>
            <h1 className="text-3xl sm:text-5xl font-black text-white tracking-tight">
              CARTA DIGITAL <span className="bg-gradient-to-r from-emerald-400 via-cyan-300 to-pink-400 bg-clip-text text-transparent">DE CONSULTA</span>
            </h1>
            <p className="text-xs sm:text-sm text-slate-300 mt-1.5 max-w-xl font-medium">
              Explora todos nuestros sabores de granizados, ingredientes y lista de precios por tamaño. Muéstrale tu selección al mesero cuando llegue a tu mesa.
            </p>
          </div>
        </div>
      </div>

      {/* BANNER GUÍA 100% INFORMATIVO */}
      <div className="mb-6 p-4 rounded-2xl bg-gradient-to-r from-emerald-500/10 via-cyan-500/10 to-pink-500/10 border border-emerald-500/30 flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center shrink-0 font-bold text-xl">
          📱
        </div>
        <div>
          <h4 className="text-xs font-black text-emerald-300 uppercase tracking-wide">
            Carta de Consulta Digital {mesaNum ? `(Mesa #${mesaNum})` : ''}
          </h4>
          <p className="text-xs text-slate-300 mt-0.5 font-medium">
            Esta carta es de consulta informativa. Por favor indícale al mesero qué bebida deseas tomar para que ingrese tu pedido.
          </p>
        </div>
      </div>

      {/* CATEGORÍAS Y BÚSQUEDA */}
      <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4 mb-8">
        <div className="flex items-center gap-2 overflow-x-auto pb-2 md:pb-0 scrollbar-none">
          <button
            onClick={() => setCategoriaSel('todos')}
            className={`px-4 py-2.5 rounded-2xl text-xs font-extrabold transition-all whitespace-nowrap flex items-center gap-2 ${
              categoriaSel === 'todos'
                ? 'bg-gradient-to-r from-emerald-400 to-cyan-400 text-slate-950 shadow-lg shadow-emerald-500/20'
                : 'bg-slate-900/80 text-slate-300 border border-slate-800 hover:border-slate-700'
            }`}
          >
            <Sparkles className="w-4 h-4" />
            <span>Todos los Granizados</span>
          </button>

          <button
            onClick={() => setCategoriaSel('con_licor')}
            className={`px-4 py-2.5 rounded-2xl text-xs font-extrabold transition-all whitespace-nowrap flex items-center gap-2 ${
              categoriaSel === 'con_licor'
                ? 'bg-gradient-to-r from-emerald-500 to-teal-400 text-slate-950 shadow-lg shadow-emerald-500/20'
                : 'bg-slate-900/80 text-slate-300 border border-slate-800 hover:border-slate-700'
            }`}
          >
            <Flame className="w-4 h-4 text-emerald-400" />
            <span>Granizados Con Licor 🍾</span>
          </button>

          <button
            onClick={() => setCategoriaSel('sin_licor')}
            className={`px-4 py-2.5 rounded-2xl text-xs font-extrabold transition-all whitespace-nowrap flex items-center gap-2 ${
              categoriaSel === 'sin_licor'
                ? 'bg-gradient-to-r from-cyan-400 to-blue-500 text-slate-950 shadow-lg shadow-cyan-500/20'
                : 'bg-slate-900/80 text-slate-300 border border-slate-800 hover:border-slate-700'
            }`}
          >
            <GlassWater className="w-4 h-4 text-cyan-400" />
            <span>Granizados Sin Licor 🍧</span>
          </button>

          <button
            onClick={() => setCategoriaSel('cremoso')}
            className={`px-4 py-2.5 rounded-2xl text-xs font-extrabold transition-all whitespace-nowrap flex items-center gap-2 ${
              categoriaSel === 'cremoso'
                ? 'bg-gradient-to-r from-pink-500 to-purple-500 text-white shadow-lg shadow-pink-500/20'
                : 'bg-slate-900/80 text-slate-300 border border-slate-800 hover:border-slate-700'
            }`}
          >
            <Layers className="w-4 h-4 text-pink-400" />
            <span>Granizados Cremosos 🍦</span>
          </button>
        </div>

        <div className="relative min-w-[240px]">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Buscar sabor o licor..."
            value={busqueda}
            onChange={(e) => setBusqueda(e.target.value)}
            className="w-full bg-slate-900/90 border border-slate-800 focus:border-emerald-500 rounded-2xl pl-10 pr-4 py-2.5 text-xs text-white placeholder-slate-500 outline-none transition-all"
          />
        </div>
      </div>

      {/* GRILLA DE PRODUCTOS PARA CONSULTA DE CLIENTES */}
      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="h-64 rounded-3xl bg-slate-900/50 animate-pulse border border-slate-800" />
          ))}
        </div>
      ) : productosFiltrados.length === 0 ? (
        <div className="text-center py-16 bg-slate-900/30 rounded-3xl border border-slate-800/60">
          <GlassWater className="w-12 h-12 text-slate-600 mx-auto mb-3" />
          <p className="text-slate-400 font-medium text-sm">No se encontraron granizados en esta categoría.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {productosFiltrados.map(prod => (
            <div 
              key={prod.id}
              className="group relative bg-slate-900/70 hover:bg-slate-900 border border-slate-800 hover:border-emerald-500/50 rounded-3xl overflow-hidden transition-all duration-300 flex flex-col justify-between"
            >
              <div className="relative h-48 w-full overflow-hidden bg-slate-950">
                <img 
                  src={prod.imagen_url} 
                  alt={prod.nombre}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/20 to-transparent" />
                
                <span className={`absolute top-3 left-3 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider ${
                  prod.categoria === 'con_licor' 
                    ? 'bg-emerald-500 text-slate-950' 
                    : prod.categoria === 'sin_licor' 
                    ? 'bg-cyan-400 text-slate-950' 
                    : 'bg-pink-500 text-white'
                }`}>
                  {prod.categoria === 'con_licor' ? 'Con Licor' : prod.categoria === 'sin_licor' ? 'Sin Licor' : 'Cremoso'}
                </span>
              </div>

              <div className="p-5 flex-1 flex flex-col justify-between">
                <div>
                  <h3 className="font-extrabold text-lg text-white group-hover:text-emerald-300 transition-colors">
                    {prod.nombre}
                  </h3>
                  {prod.ingredientes && (
                    <p className="text-xs text-slate-400 mt-1 font-medium italic">
                      {prod.ingredientes}
                    </p>
                  )}

                  {/* Tabla de Precios por Tamaño */}
                  <div className="mt-3 grid grid-cols-3 gap-1 text-[11px] bg-slate-950 p-2 rounded-xl border border-slate-800 text-center">
                    <div>
                      <span className="text-slate-500 block text-[9px] font-bold">8 oz</span>
                      <strong className="text-slate-200">{formatCOP(prod.precio_8oz)}</strong>
                    </div>
                    <div>
                      <span className="text-slate-500 block text-[9px] font-bold">12 oz</span>
                      <strong className="text-emerald-400">{formatCOP(prod.precio_12oz)}</strong>
                    </div>
                    <div>
                      <span className="text-slate-500 block text-[9px] font-bold">24 oz</span>
                      <strong className="text-slate-200">{formatCOP(prod.precio_24oz)}</strong>
                    </div>
                  </div>
                </div>

                <div className="mt-4 pt-3 border-t border-slate-800/80">
                  <button
                    onClick={() => setSelectedProduct(prod)}
                    className="w-full py-3 bg-slate-800 hover:bg-slate-700 text-emerald-300 font-extrabold rounded-2xl text-xs flex items-center justify-center gap-2 transition-all border border-slate-700 active:scale-95"
                  >
                    <span>🔍 Ver Todos los Tamaños</span>
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* MODAL DETALLE DE PRODUCTO Y PRECIOS POR TAMAÑO */}
      {selectedProduct && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md">
          <div className="w-full max-w-md bg-[#080c14] border border-emerald-500/40 rounded-3xl p-6 shadow-2xl glow-emerald">
            
            <div className="flex items-center justify-between pb-4 border-b border-slate-800">
              <div>
                <span className="text-[10px] font-black text-emerald-400 uppercase tracking-wider block">
                  Detalle de Bebida
                </span>
                <h3 className="text-xl font-extrabold text-white">{selectedProduct.nombre}</h3>
              </div>
              <button 
                onClick={() => setSelectedProduct(null)}
                className="text-slate-400 hover:text-white p-2 rounded-xl text-xs font-bold"
              >
                ✕
              </button>
            </div>

            <p className="text-xs text-slate-400 my-3 font-medium">
              Ingredientes: <em className="text-slate-200">{selectedProduct.ingredientes}</em>
            </p>

            <div className="space-y-2.5 my-5">
              {[
                { size: '8oz', label: 'PEQUEÑO (8 oz)', price: selectedProduct.precio_8oz },
                { size: '12oz', label: 'MEDIANO (12 oz)', price: selectedProduct.precio_12oz },
                { size: '24oz', label: 'GRANDE (24 oz)', price: selectedProduct.precio_24oz },
                { size: '100oz', label: 'NEVERA (100 oz)', price: selectedProduct.precio_100oz }
              ].map(opt => (
                <div
                  key={opt.size}
                  className="w-full p-3.5 rounded-2xl border border-slate-800 bg-slate-900/80 text-left flex items-center justify-between"
                >
                  <span className="font-extrabold text-xs text-white">{opt.label}</span>
                  <span className="font-black text-sm text-emerald-400">{formatCOP(opt.price)}</span>
                </div>
              ))}
            </div>

            <div className="p-3 bg-slate-900 rounded-2xl border border-slate-800 text-center">
              <p className="text-xs text-emerald-300 font-bold">
                💡 Muéstrale esta opción a tu mesero cuando llegue a tu mesa para solicitar tu pedido.
              </p>
            </div>

          </div>
        </div>
      )}

    </div>
  );
}
