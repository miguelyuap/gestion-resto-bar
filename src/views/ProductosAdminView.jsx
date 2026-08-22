import React, { useState, useEffect } from 'react';
import { 
  Package, Plus, Search, Trash2, RefreshCw, Sparkles, 
  Tag, Image as ImageIcon, AlertTriangle, CheckCircle2, X, DollarSign, Layers
} from 'lucide-react';
import { apiService } from '../services/api';
import { useAuth } from '../context/AuthContext';

export function ProductosAdminView() {
  const { negocio, formatCurrency } = useAuth();
  const [productos, setProductos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [categoriaSel, setCategoriaSel] = useState('todos');
  const [busqueda, setBusqueda] = useState('');

  // Modal para Crear Producto
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // Campos del Formulario de Producto
  const [nombre, setNombre] = useState('');
  const [categoria, setCategoria] = useState('con_licor');
  const [nuevaCategoriaText, setNuevaCategoriaText] = useState('');
  const [isCreandoNuevaCat, setIsCreandoNuevaCat] = useState(false);
  const [ingredientes, setIngredientes] = useState('');
  const [precio8oz, setPrecio8oz] = useState('');
  const [precio12oz, setPrecio12oz] = useState('');
  const [precio24oz, setPrecio24oz] = useState('');
  const [precio100oz, setPrecio100oz] = useState('');
  const [imagenUrl, setImagenUrl] = useState('');

  // Modal para Confirmar Eliminación
  const [productToDelete, setProductToDelete] = useState(null);

  // Notificaciones
  const [feedback, setFeedback] = useState(null);

  const loadProductos = async () => {
    try {
      setLoading(true);
      const data = await apiService.getProductos(negocio?.id);
      setProductos(data);
    } catch (err) {
      console.error('Error al cargar productos:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadProductos();
  }, [negocio]);

  // Extraer categorías dinámicas únicas de los productos existentes
  const categoriasExistentes = Array.from(
    new Set(productos.map(p => p.categoria).filter(Boolean))
  );

  const handleSelectCategoriaOption = (val) => {
    if (val === '__NUEVA__') {
      setIsCreandoNuevaCat(true);
      setCategoria('');
    } else {
      setIsCreandoNuevaCat(false);
      setCategoria(val);
    }
  };

  const handleCreateProduct = async (e) => {
    e.preventDefault();
    const finalCategory = isCreandoNuevaCat ? nuevaCategoriaText.trim() : categoria.trim();

    if (!nombre.trim() || !finalCategory) {
      setFeedback({ type: 'error', message: 'El nombre y la categoría son obligatorios.' });
      return;
    }

    try {
      setIsSubmitting(true);
      setFeedback(null);

      await apiService.crearProducto(
        {
          nombre,
          categoria: finalCategory,
          ingredientes,
          precio_8oz: precio8oz || 0,
          precio_12oz: precio12oz || 0,
          precio_24oz: precio24oz || 0,
          precio_100oz: precio100oz || 0,
          imagen_url: imagenUrl
        },
        negocio?.id
      );

      setFeedback({ type: 'success', message: `Producto "${nombre}" creado exitosamente.` });

      // Reset Form
      setNombre('');
      setCategoria(categoriasExistentes[0] || 'con_licor');
      setNuevaCategoriaText('');
      setIsCreandoNuevaCat(false);
      setIngredientes('');
      setPrecio8oz('');
      setPrecio12oz('');
      setPrecio24oz('');
      setPrecio100oz('');
      setImagenUrl('');
      setIsModalOpen(false);

      loadProductos();
    } catch (err) {
      console.error('Error creando producto:', err);
      setFeedback({ type: 'error', message: 'No se pudo crear el producto. Intenta nuevamente.' });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteProduct = async () => {
    if (!productToDelete) return;
    try {
      setIsSubmitting(true);
      await apiService.eliminarProducto(productToDelete.id, negocio?.id);
      setFeedback({ type: 'success', message: `Producto "${productToDelete.nombre}" eliminado.` });
      setProductToDelete(null);
      loadProductos();
    } catch (err) {
      console.error('Error al eliminar producto:', err);
      setFeedback({ type: 'error', message: 'No se pudo eliminar el producto.' });
    } finally {
      setIsSubmitting(false);
    }
  };

  const productosFiltrados = productos.filter(p => {
    const matchCat = categoriaSel === 'todos' || p.categoria === categoriaSel;
    const matchSearch = 
      p.nombre.toLowerCase().includes(busqueda.toLowerCase()) ||
      (p.ingredientes && p.ingredientes.toLowerCase().includes(busqueda.toLowerCase())) ||
      (p.categoria && p.categoria.toLowerCase().includes(busqueda.toLowerCase()));
    return matchCat && matchSearch;
  });

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 pb-24">
      
      {/* HEADER DE GESTIÓN DE PRODUCTOS */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 rounded-2xl shadow-sm transition-colors duration-200">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-emerald-500 text-slate-950 flex items-center justify-center font-black text-xl shrink-0 shadow-sm">
            🍸
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl sm:text-2xl font-extrabold text-slate-900 dark:text-white">Gestión de Productos y Menú</h1>
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              {negocio?.nombre || 'GST Resto Bar'} &bull; Agrega, administra y elimina productos o categorías del catálogo
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={loadProductos}
            className="p-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white border border-slate-200 dark:border-slate-700 transition-colors"
            title="Recargar catálogo"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          </button>

          <button
            onClick={() => setIsModalOpen(true)}
            className="px-5 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-extrabold text-xs flex items-center gap-2 transition-all shadow-md shadow-emerald-500/20 active:scale-95"
          >
            <Plus className="w-4 h-4" />
            <span>Agregar Producto</span>
          </button>
        </div>
      </div>

      {/* FEEDBACK ALERT */}
      {feedback && (
        <div className={`mb-6 p-4 rounded-xl border text-xs font-bold flex items-center justify-between transition-all ${
          feedback.type === 'success'
            ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-600 dark:text-emerald-400'
            : 'bg-rose-500/10 border-rose-500/30 text-rose-600 dark:text-rose-400'
        }`}>
          <div className="flex items-center gap-2">
            {feedback.type === 'success' ? <CheckCircle2 className="w-4 h-4" /> : <AlertTriangle className="w-4 h-4" />}
            <span>{feedback.message}</span>
          </div>
          <button onClick={() => setFeedback(null)} className="opacity-70 hover:opacity-100">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* CATEGORÍAS DINÁMICAS Y BÚSQUEDA */}
      <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4 mb-8">
        <div className="flex items-center gap-2 overflow-x-auto pb-2 md:pb-0 no-scrollbar">
          <button
            onClick={() => setCategoriaSel('todos')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap flex items-center gap-2 border shrink-0 ${
              categoriaSel === 'todos'
                ? 'bg-emerald-500 text-slate-950 border-emerald-400 shadow-sm'
                : 'bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-400 border-slate-200 dark:border-slate-800 hover:text-slate-900 dark:hover:text-slate-200'
            }`}
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>Todas las Categorías ({productos.length})</span>
          </button>

          {categoriasExistentes.map(cat => (
            <button
              key={cat}
              onClick={() => setCategoriaSel(cat)}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap flex items-center gap-2 border shrink-0 capitalize ${
                categoriaSel === cat
                  ? 'bg-emerald-500 text-slate-950 border-emerald-400 shadow-sm'
                  : 'bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-400 border-slate-200 dark:border-slate-800 hover:text-slate-900 dark:hover:text-slate-200'
              }`}
            >
              <Tag className="w-3.5 h-3.5" />
              <span>{cat.replace('_', ' ')}</span>
            </button>
          ))}
        </div>

        <div className="relative w-full md:w-72">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Buscar por nombre, categoría o ingredientes..."
            value={busqueda}
            onChange={(e) => setBusqueda(e.target.value)}
            className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl pl-10 pr-4 py-2.5 text-xs text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:border-emerald-500/50 shadow-sm"
          />
        </div>
      </div>

      {/* GRILLA DE PRODUCTOS */}
      {loading ? (
        <div className="py-20 text-center text-slate-500 text-xs flex flex-col items-center gap-2">
          <RefreshCw className="w-6 h-6 animate-spin text-emerald-500" />
          <span>Cargando productos del menú...</span>
        </div>
      ) : productosFiltrados.length === 0 ? (
        <div className="py-16 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl text-center text-slate-500 dark:text-slate-400 text-xs">
          No se encontraron productos registrados en esta categoría.
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {productosFiltrados.map(prod => (
            <div
              key={prod.id}
              className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 rounded-2xl overflow-hidden transition-all shadow-sm flex flex-col justify-between"
            >
              <div>
                <div className="relative h-44 overflow-hidden bg-slate-950">
                  <img
                    src={prod.imagen_url || 'https://images.unsplash.com/photo-1536935338788-846bb9981813?auto=format&fit=crop&w=400&q=80'}
                    alt={prod.nombre}
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute top-3 left-3 bg-slate-950/80 backdrop-blur-md px-2.5 py-1 rounded-full text-[10px] font-black text-emerald-400 border border-slate-800 uppercase tracking-wider">
                    {prod.categoria.replace('_', ' ')}
                  </div>

                  <button
                    onClick={() => setProductToDelete(prod)}
                    className="absolute top-3 right-3 p-2 rounded-xl bg-rose-500/80 hover:bg-rose-600 text-white backdrop-blur-md transition-colors shadow-md"
                    title="Eliminar Producto"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>

                <div className="p-5 space-y-3">
                  <div>
                    <h3 className="font-extrabold text-base text-slate-900 dark:text-white">
                      {prod.nombre}
                    </h3>
                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 line-clamp-2">
                      {prod.ingredientes || 'Sin ingredientes especificados.'}
                    </p>
                  </div>

                  {/* Precios por tamaño */}
                  <div className="grid grid-cols-2 gap-2 text-xs pt-2 border-t border-slate-100 dark:border-slate-800/80">
                    <div className="bg-slate-50 dark:bg-slate-950 p-2 rounded-xl border border-slate-200 dark:border-slate-800/60">
                      <span className="text-[10px] text-slate-400 dark:text-slate-500 block">8 oz</span>
                      <span className="font-bold text-slate-700 dark:text-slate-200">{formatCurrency(prod.precio_8oz)}</span>
                    </div>
                    <div className="bg-slate-50 dark:bg-slate-950 p-2 rounded-xl border border-slate-200 dark:border-slate-800/60">
                      <span className="text-[10px] text-slate-400 dark:text-slate-500 block">12 oz</span>
                      <span className="font-bold text-emerald-600 dark:text-emerald-400">{formatCurrency(prod.precio_12oz)}</span>
                    </div>
                    <div className="bg-slate-50 dark:bg-slate-950 p-2 rounded-xl border border-slate-200 dark:border-slate-800/60">
                      <span className="text-[10px] text-slate-400 dark:text-slate-500 block">24 oz</span>
                      <span className="font-bold text-slate-700 dark:text-slate-200">{formatCurrency(prod.precio_24oz)}</span>
                    </div>
                    <div className="bg-slate-50 dark:bg-slate-950 p-2 rounded-xl border border-slate-200 dark:border-slate-800/60">
                      <span className="text-[10px] text-slate-400 dark:text-slate-500 block">100 oz</span>
                      <span className="font-bold text-slate-700 dark:text-slate-200">{formatCurrency(prod.precio_100oz)}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* MODAL CREAR PRODUCTO */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-950/70 dark:bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 w-full max-w-lg rounded-2xl p-6 shadow-2xl space-y-4 max-h-[90vh] overflow-y-auto">
            
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
              <div className="flex items-center gap-2">
                <Package className="w-5 h-5 text-emerald-500" />
                <h3 className="font-extrabold text-base text-slate-900 dark:text-white">Agregar Nuevo Producto</h3>
              </div>
              <button
                onClick={() => setIsModalOpen(false)}
                className="p-1 text-slate-400 hover:text-slate-600 dark:hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateProduct} className="space-y-4 text-xs">
              
              {/* Nombre */}
              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Nombre del Producto *</label>
                <input
                  type="text"
                  required
                  placeholder="Ej. MOJITO CUBANO SPECL"
                  value={nombre}
                  onChange={(e) => setNombre(e.target.value)}
                  className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-3 py-2.5 text-slate-900 dark:text-white focus:outline-none focus:border-emerald-500"
                />
              </div>

              {/* Categoría Dinámica */}
              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Categoría del Producto *</label>
                <select
                  value={isCreandoNuevaCat ? '__NUEVA__' : categoria}
                  onChange={(e) => handleSelectCategoriaOption(e.target.value)}
                  className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-3 py-2.5 text-slate-900 dark:text-white focus:outline-none focus:border-emerald-500 capitalize"
                >
                  <option value="con_licor">Con Licor 🍾</option>
                  <option value="sin_licor">Sin Licor 🍧</option>
                  <option value="cremoso">Cremosos 🍦</option>
                  <option value="comidas">Comidas 🍔</option>
                  <option value="entradas">Entradas 🍟</option>

                  {/* Otras categorías ya existentes en el sistema */}
                  {categoriasExistentes
                    .filter(cat => !['con_licor', 'sin_licor', 'cremoso', 'comidas', 'entradas'].includes(cat))
                    .map(cat => (
                      <option key={cat} value={cat}>{cat.replace('_', ' ')}</option>
                    ))
                  }

                  <option value="__NUEVA__">➕ Crear Nueva Categoría...</option>
                </select>

                {isCreandoNuevaCat && (
                  <div className="mt-2">
                    <input
                      type="text"
                      required
                      placeholder="Escribe el nombre de la nueva categoría (ej. Cervezas)"
                      value={nuevaCategoriaText}
                      onChange={(e) => setNuevaCategoriaText(e.target.value)}
                      className="w-full bg-slate-50 dark:bg-slate-950 border border-emerald-500/50 rounded-xl px-3 py-2.5 text-slate-900 dark:text-white focus:outline-none"
                    />
                  </div>
                )}
              </div>

              {/* Ingredientes */}
              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Ingredientes o Descripción</label>
                <input
                  type="text"
                  placeholder="Ej. Ron blanco, menta fresca, soda y limón"
                  value={ingredientes}
                  onChange={(e) => setIngredientes(e.target.value)}
                  className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-3 py-2.5 text-slate-900 dark:text-white focus:outline-none focus:border-emerald-500"
                />
              </div>

              {/* Precios */}
              <div className="grid grid-cols-2 gap-3 pt-2">
                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Precio 8 oz</label>
                  <input
                    type="number"
                    placeholder="12000"
                    value={precio8oz}
                    onChange={(e) => setPrecio8oz(e.target.value)}
                    className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-3 py-2 text-slate-900 dark:text-white focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Precio 12 oz</label>
                  <input
                    type="number"
                    placeholder="16000"
                    value={precio12oz}
                    onChange={(e) => setPrecio12oz(e.target.value)}
                    className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-3 py-2 text-slate-900 dark:text-white focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Precio 24 oz</label>
                  <input
                    type="number"
                    placeholder="24000"
                    value={precio24oz}
                    onChange={(e) => setPrecio24oz(e.target.value)}
                    className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-3 py-2 text-slate-900 dark:text-white focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Precio 100 oz / Jarra</label>
                  <input
                    type="number"
                    placeholder="70000"
                    value={precio100oz}
                    onChange={(e) => setPrecio100oz(e.target.value)}
                    className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-3 py-2 text-slate-900 dark:text-white focus:outline-none"
                  />
                </div>
              </div>

              {/* Imagen URL */}
              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">URL de Imagen</label>
                <input
                  type="text"
                  placeholder="https://images.unsplash.com/photo-..."
                  value={imagenUrl}
                  onChange={(e) => setImagenUrl(e.target.value)}
                  className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-3 py-2.5 text-slate-900 dark:text-white focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-bold"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-5 py-2.5 rounded-xl bg-emerald-500 text-slate-950 font-black shadow-md hover:bg-emerald-400 disabled:opacity-50"
                >
                  {isSubmitting ? 'Guardando...' : 'Crear Producto'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL CONFIRMAR ELIMINACIÓN */}
      {productToDelete && (
        <div className="fixed inset-0 z-50 bg-slate-950/70 dark:bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 w-full max-w-sm rounded-2xl p-6 shadow-2xl space-y-4 text-center">
            <div className="w-12 h-12 rounded-full bg-rose-500/10 text-rose-500 flex items-center justify-center mx-auto">
              <AlertTriangle className="w-6 h-6" />
            </div>

            <div>
              <h3 className="font-extrabold text-base text-slate-900 dark:text-white">¿Eliminar Producto?</h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                ¿Estás seguro de eliminar <strong className="text-slate-800 dark:text-slate-200">"{productToDelete.nombre}"</strong> del catálogo? Esta acción no se puede deshacer.
              </p>
            </div>

            <div className="flex items-center justify-center gap-3 pt-2">
              <button
                onClick={() => setProductToDelete(null)}
                className="px-4 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-bold text-xs"
              >
                Cancelar
              </button>
              <button
                onClick={handleDeleteProduct}
                disabled={isSubmitting}
                className="px-4 py-2 rounded-xl bg-rose-600 text-white font-black text-xs shadow-md hover:bg-rose-500 disabled:opacity-50"
              >
                {isSubmitting ? 'Eliminando...' : 'Sí, Eliminar'}
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
