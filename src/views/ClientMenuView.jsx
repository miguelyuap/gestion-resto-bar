import React, { useState, useEffect } from 'react';
import { Search, Sparkles, Wine, GlassWater, Flame, Layers } from 'lucide-react';
import { apiService } from '../services/api';
import { useAuth } from '../context/AuthContext';

export function ClientMenuView({ mesaNum }) {
  const { negocio, formatCurrency } = useAuth();
  const [productos, setProductos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [categoriaSel, setCategoriaSel] = useState('todos');
  const [busqueda, setBusqueda] = useState('');
  const [selectedProduct, setSelectedProduct] = useState(null);

  useEffect(() => {
    async function loadProducts() {
      try {
        setLoading(true);
        const data = await apiService.getProductos(negocio?.id);
        setProductos(data);
      } catch (err) {
        console.error('Error al cargar carta digital:', err);
      } finally {
        setLoading(false);
      }
    }
    loadProducts();
  }, [negocio]);

  // Filtrado de Productos
  const productosFiltrados = productos.filter(p => {
    const matchCat = categoriaSel === 'todos' || p.categoria === categoriaSel;
    const matchSearch = 
      p.nombre.toLowerCase().includes(busqueda.toLowerCase()) ||
      (p.ingredientes && p.ingredientes.toLowerCase().includes(busqueda.toLowerCase()));
    return matchCat && matchSearch;
  });

  const brandName = negocio?.nombre || 'GST Resto Bar';

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 pb-20">
      
      {/* BANNER PRINCIPAL DE LA MARCA PARA EL CLIENTE */}
      <div className="relative overflow-hidden rounded-2xl bg-slate-900 border border-slate-800 p-6 sm:p-8 mb-6 shadow-md">
        <div className="relative z-10 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-400 text-xs font-bold uppercase tracking-wider border border-emerald-500/20">
                {brandName} 🍹
              </span>
              {mesaNum && (
                <span className="px-3 py-1 rounded-full bg-slate-800 text-slate-200 text-xs font-bold uppercase tracking-wider border border-slate-700">
                  Mesa #{mesaNum}
                </span>
              )}
            </div>
            <h1 className="text-2xl sm:text-4xl font-extrabold text-white tracking-tight">
              Menú Digital <span className="text-emerald-400">Interactivo</span>
            </h1>
            <p className="text-xs sm:text-sm text-slate-400 mt-1.5 max-w-xl font-medium">
              Explora nuestros productos, ingredientes y precios por presentación. Compara tus opciones y pídele a tu mesero cuando pase por tu mesa.
            </p>
          </div>
        </div>
      </div>

      {/* BANNER GUÍA INFORMATIVO */}
      <div className="mb-6 p-4 rounded-xl bg-slate-900 border border-slate-800 flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl bg-emerald-500/10 text-emerald-400 flex items-center justify-center shrink-0 font-bold text-xl">
          📱
        </div>
        <div>
          <h4 className="text-xs font-bold text-slate-200 uppercase tracking-wide">
            Carta de Consulta {mesaNum ? `(Mesa #${mesaNum})` : ''}
          </h4>
          <p className="text-xs text-slate-400 mt-0.5 font-medium">
            Esta carta es de consulta informativa. Puedes revisar precios e ingredientes antes de pedirle al mesero.
          </p>
        </div>
      </div>

      {/* CATEGORÍAS Y BÚSQUEDA */}
      <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4 mb-8">
        <div className="flex items-center gap-2 overflow-x-auto pb-2 md:pb-0 no-scrollbar">
          {[
            { id: 'todos', label: 'Todos', icon: Sparkles },
            { id: 'con_licor', label: 'Con Licor', icon: Flame },
            { id: 'sin_licor', label: 'Sin Licor', icon: GlassWater },
            { id: 'cremoso', label: 'Cremosos', icon: Layers }
          ].map(cat => {
            const Icon = cat.icon;
            const active = categoriaSel === cat.id;
            return (
              <button
                key={cat.id}
                onClick={() => setCategoriaSel(cat.id)}
                className={`px-4 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap flex items-center gap-2 border shrink-0 ${
                  active
                    ? 'bg-emerald-500 text-slate-950 border-emerald-400 shadow-sm'
                    : 'bg-slate-900 text-slate-400 border-slate-800 hover:text-slate-200'
                }`}
              >
                <Icon className="w-4 h-4" />
                <span>{cat.label}</span>
              </button>
            );
          })}
        </div>

        <div className="relative w-full md:w-72">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Buscar por nombre o sabor..."
            value={busqueda}
            onChange={(e) => setBusqueda(e.target.value)}
            className="w-full bg-slate-900 border border-slate-800 rounded-xl pl-10 pr-4 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500/50"
          />
        </div>
      </div>

      {/* GRID DE PRODUCTOS */}
      {loading ? (
        <div className="py-20 text-center text-slate-500 text-xs">
          Cargando carta digital...
        </div>
      ) : productosFiltrados.length === 0 ? (
        <div className="py-16 bg-slate-900 border border-slate-800 rounded-xl text-center text-slate-400 text-xs">
          No se encontraron resultados para tu búsqueda.
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {productosFiltrados.map(prod => (
            <div
              key={prod.id}
              onClick={() => setSelectedProduct(prod)}
              className="bg-slate-900 border border-slate-800 hover:border-slate-700 rounded-2xl overflow-hidden cursor-pointer group transition-all"
            >
              <div className="relative h-44 overflow-hidden">
                <img
                  src={prod.imagen_url || 'https://images.unsplash.com/photo-1536935338788-846bb9981813?auto=format&fit=crop&w=400&q=80'}
                  alt={prod.nombre}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                />
                <div className="absolute top-3 right-3 bg-slate-950/80 backdrop-blur-md px-2.5 py-1 rounded-full text-[10px] font-bold text-emerald-400 border border-slate-800 uppercase">
                  {prod.categoria.replace('_', ' ')}
                </div>
              </div>

              <div className="p-5 space-y-3">
                <div>
                  <h3 className="font-extrabold text-base text-white group-hover:text-emerald-400 transition-colors">
                    {prod.nombre}
                  </h3>
                  <p className="text-xs text-slate-400 mt-1 line-clamp-2">
                    {prod.ingredientes || 'Deliciosas combinaciones frutas y granizados.'}
                  </p>
                </div>

                <div className="pt-3 border-t border-slate-800/80 grid grid-cols-2 gap-2 text-xs">
                  <div className="bg-slate-950 p-2 rounded-xl border border-slate-800/60">
                    <span className="text-[10px] text-slate-500 block">Vasito 8 oz</span>
                    <span className="font-bold text-slate-200">{formatCurrency(prod.precio_8oz)}</span>
                  </div>
                  <div className="bg-slate-950 p-2 rounded-xl border border-slate-800/60">
                    <span className="text-[10px] text-slate-500 block">Estándar 12 oz</span>
                    <span className="font-bold text-emerald-400">{formatCurrency(prod.precio_12oz)}</span>
                  </div>
                  <div className="bg-slate-950 p-2 rounded-xl border border-slate-800/60">
                    <span className="text-[10px] text-slate-500 block">Grande 24 oz</span>
                    <span className="font-bold text-slate-200">{formatCurrency(prod.precio_24oz)}</span>
                  </div>
                  <div className="bg-slate-950 p-2 rounded-xl border border-slate-800/60">
                    <span className="text-[10px] text-slate-500 block">Jarra 100 oz</span>
                    <span className="font-bold text-slate-200">{formatCurrency(prod.precio_100oz)}</span>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* MODAL DETALLE DE PRODUCTO */}
      {selectedProduct && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 w-full max-w-md rounded-2xl overflow-hidden shadow-2xl space-y-4">
            <div className="relative h-48">
              <img
                src={selectedProduct.imagen_url}
                alt={selectedProduct.nombre}
                className="w-full h-full object-cover"
              />
              <button
                onClick={() => setSelectedProduct(null)}
                className="absolute top-3 right-3 bg-slate-950/80 text-white w-8 h-8 rounded-full flex items-center justify-center font-bold"
              >
                ✕
              </button>
            </div>

            <div className="p-5 space-y-4">
              <div>
                <h3 className="font-extrabold text-lg text-white">{selectedProduct.nombre}</h3>
                <p className="text-xs text-slate-400 mt-1">{selectedProduct.ingredientes}</p>
              </div>

              <div className="grid grid-cols-2 gap-2 text-xs">
                <div className="bg-slate-950 p-3 rounded-xl border border-slate-800">
                  <span className="text-[10px] text-slate-500 block">8 oz</span>
                  <span className="font-bold text-white text-sm">{formatCurrency(selectedProduct.precio_8oz)}</span>
                </div>
                <div className="bg-slate-950 p-3 rounded-xl border border-slate-800">
                  <span className="text-[10px] text-slate-500 block">12 oz</span>
                  <span className="font-bold text-emerald-400 text-sm">{formatCurrency(selectedProduct.precio_12oz)}</span>
                </div>
                <div className="bg-slate-950 p-3 rounded-xl border border-slate-800">
                  <span className="text-[10px] text-slate-500 block">24 oz</span>
                  <span className="font-bold text-white text-sm">{formatCurrency(selectedProduct.precio_24oz)}</span>
                </div>
                <div className="bg-slate-950 p-3 rounded-xl border border-slate-800">
                  <span className="text-[10px] text-slate-500 block">100 oz</span>
                  <span className="font-bold text-white text-sm">{formatCurrency(selectedProduct.precio_100oz)}</span>
                </div>
              </div>

              <button
                onClick={() => setSelectedProduct(null)}
                className="w-full py-2.5 rounded-xl bg-slate-800 text-slate-200 font-bold text-xs"
              >
                Cerrar
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
