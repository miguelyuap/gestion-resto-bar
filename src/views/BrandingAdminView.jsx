import React, { useState, useEffect } from 'react';
import { Sparkles, Palette, Tag, Wifi, Smartphone, Clock, Plus, Trash2, ShieldCheck, Image, Upload, Camera, Link as LinkIcon, Copy, Check } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const ACCENT_OPTIONS = [
  { key: 'amber', label: 'Golden Amber', color: '#F59E0B', glow: 'rgba(245,158,11,0.35)' },
  { key: 'emerald', label: 'Emerald Neon', color: '#10B981', glow: 'rgba(16,185,129,0.35)' },
  { key: 'rose', label: 'Rose Lounge', color: '#F43F5E', glow: 'rgba(244,63,94,0.35)' },
];

const ACCENT_HEX = {
  amber: '#F59E0B',
  emerald: '#10B981',
  rose: '#F43F5E',
};

const DEFAULT_COVER = 'https://images.unsplash.com/photo-1514933651103-005eec06c04b?w=800&fit=crop&auto=format';
const DEFAULT_LOGO = 'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=200&fit=crop&auto=format';

const INITIAL_PROMOS = [
  { id: 1, name: 'Happy Hour 2x1 Cocktails', type: '2x1', value: '2×1', category: 'Cocktails', days: ['L','M','X','J','V'], startTime: '18:00', endTime: '21:00', active: true, badge: 'TOP VENTAS' },
  { id: 2, name: '-20% Smash Burgers', type: 'discount', value: '20%', category: 'Burgers', days: ['V','S','D'], startTime: '12:00', endTime: '16:00', active: true, badge: 'RECOMENDADO' },
  { id: 3, name: 'Combo Pizza + Postre', type: 'combo', value: '$18', category: 'Varios', days: ['L','M','X','J','V','S','D'], startTime: '20:00', endTime: '23:59', active: false, badge: undefined },
];

function Toggle({ on, onChange }) {
  return (
    <button
      type="button"
      onClick={onChange}
      className="relative inline-flex w-11 h-6 rounded-full transition-colors duration-200 focus:outline-none flex-shrink-0"
      style={{ backgroundColor: on ? '#10B981' : '#334155' }}
    >
      <span
        className="inline-block w-5 h-5 rounded-full bg-white shadow-md transition-transform duration-200 mt-0.5"
        style={{ transform: on ? 'translateX(22px)' : 'translateX(2px)' }}
      />
    </button>
  );
}

function PhoneMockup({ name, tagline, accent, wifiName, wifiPass, promos, logoUrl, coverUrl }) {
  const accentHex = ACCENT_HEX[accent] || '#F59E0B';
  const activePromo = promos.find(p => p.active);

  return (
    <div className="relative mx-auto w-[250px] h-[500px]">
      {/* Marco de Teléfono */}
      <div className="absolute inset-0 rounded-[40px] border-[7px] border-slate-700 dark:border-slate-800 bg-slate-950 overflow-hidden shadow-2xl flex flex-col">
        {/* Barra de estado superior */}
        <div className="h-6 bg-slate-950 flex items-center justify-between px-5 pt-1 text-[9px] text-slate-400 font-mono">
          <span>9:41</span>
          <div className="w-12 h-3 bg-slate-900 rounded-full border border-slate-800" />
          <span>100%</span>
        </div>

        {/* Portada y Header */}
        <div className="relative h-28 bg-gradient-to-br from-slate-900 to-slate-950 flex-shrink-0 overflow-hidden">
          <img
            src={coverUrl || DEFAULT_COVER}
            alt="Cover"
            className="w-full h-full object-cover opacity-60"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/40 to-transparent" />
          
          <div className="absolute bottom-2 left-3 right-3 flex items-end justify-between">
            <div className="w-12 h-12 rounded-xl bg-slate-900 border-2 border-slate-950 flex items-center justify-center font-bold text-xs shadow-lg text-white overflow-hidden" style={{ borderColor: accentHex }}>
              {logoUrl ? (
                <img src={logoUrl} alt="Logo" className="w-full h-full object-cover" />
              ) : (
                <span>{name ? name.substring(0, 3).toUpperCase() : 'GST'}</span>
              )}
            </div>
            <span className="text-[9px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
              ● ABIERTO
            </span>
          </div>
        </div>

        {/* Info de Marca */}
        <div className="p-3 bg-slate-950 text-white space-y-2 flex-1 overflow-y-auto">
          <div>
            <h4 className="text-xs font-bold truncate leading-tight">{name || 'Nombre RestoBar'}</h4>
            <p className="text-[9.5px] text-slate-400 line-clamp-1">{tagline || 'Eslogan o bienvenida'}</p>
          </div>

          {/* Badge WiFi */}
          {wifiName && (
            <div className="bg-slate-900 border border-slate-800 p-1.5 rounded-lg flex items-center gap-1.5 text-[9px] text-slate-300">
              <Wifi className="w-3 h-3 text-amber-400 shrink-0" />
              <div className="truncate">
                <span className="font-bold text-white">WiFi:</span> {wifiName} {wifiPass ? `(${wifiPass})` : ''}
              </div>
            </div>
          )}

          {/* Banner de Promoción Activa */}
          {activePromo ? (
            <div className="p-2 rounded-xl border flex items-center justify-between gap-1.5" style={{ backgroundColor: `${accentHex}15`, borderColor: `${accentHex}40` }}>
              <div className="min-w-0">
                <span className="text-[8px] font-black uppercase tracking-wider block" style={{ color: accentHex }}>🔥 OFERTA ACTIVA</span>
                <p className="text-[9.5px] font-bold text-white truncate">{activePromo.name}</p>
                <p className="text-[8px] text-slate-400">{activePromo.startTime} - {activePromo.endTime}</p>
              </div>
              <span className="px-1.5 py-0.5 rounded text-[9px] font-black text-slate-950" style={{ backgroundColor: accentHex }}>
                {activePromo.value}
              </span>
            </div>
          ) : (
            <div className="p-2 rounded-xl border border-slate-800 bg-slate-900 text-center text-[9px] text-slate-400">
              Sin promociones activas ahora
            </div>
          )}

          {/* Categorías simuladas */}
          <div className="flex gap-1 overflow-x-auto py-1 text-[9px]">
            <span className="px-2 py-0.5 rounded-full font-bold text-slate-950 shrink-0" style={{ backgroundColor: accentHex }}>Todos</span>
            <span className="px-2 py-0.5 rounded-full bg-slate-900 text-slate-400 shrink-0 border border-slate-800">Burgers</span>
            <span className="px-2 py-0.5 rounded-full bg-slate-900 text-slate-400 shrink-0 border border-slate-800">Tragos</span>
          </div>

          {/* Tarjeta de producto simulado */}
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-1.5 flex gap-2 items-center">
            <img src="https://images.unsplash.com/photo-1550547660-d9450f859349?w=100&h=100&fit=crop" className="w-10 h-10 rounded-lg object-cover" alt="Item" />
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-1">
                <span className="text-[7px] font-bold px-1 rounded bg-rose-500 text-white">-20%</span>
                <span className="text-[9.5px] font-bold text-white truncate">Smash Classic</span>
              </div>
              <p className="text-[8px] text-amber-400 font-bold">$12.90 <span className="line-through text-slate-500">$16.10</span></p>
            </div>
            <button className="w-5 h-5 rounded bg-amber-500 text-slate-950 font-bold text-[10px] flex items-center justify-center">+</button>
          </div>
        </div>
      </div>
    </div>
  );
}

export function BrandingAdminView() {
  const { negocio } = useAuth();
  
  // Cargar configuración guardada
  const initialBranding = React.useMemo(() => {
    const saved = localStorage.getItem('gst_resto_branding');
    return saved ? JSON.parse(saved) : {
      name: negocio?.nombre || 'GST Resto Bar',
      tagline: 'Coctelería de autor, hamburguesas artesanas y buenas vibras.',
      wifiName: 'RestoBar_5G',
      wifiPass: 'invitados2026',
      accent: 'amber',
      logoUrl: '',
      coverUrl: ''
    };
  }, [negocio]);

  // Branding state
  const [name, setName] = useState(initialBranding.name);
  const [tagline, setTagline] = useState(initialBranding.tagline);
  const [wifiName, setWifiName] = useState(initialBranding.wifiName);
  const [wifiPass, setWifiPass] = useState(initialBranding.wifiPass);
  const [accent, setAccent] = useState(initialBranding.accent);
  const [logoUrl, setLogoUrl] = useState(initialBranding.logoUrl || '');
  const [coverUrl, setCoverUrl] = useState(initialBranding.coverUrl || '');

  const [activeTab, setActiveTab] = useState('branding');

  // Promos state
  const [promos, setPromos] = useState(() => {
    const saved = localStorage.getItem('gst_resto_promos');
    return saved ? JSON.parse(saved) : INITIAL_PROMOS;
  });

  const [newPromoName, setNewPromoName] = useState('');
  const [newPromoType, setNewPromoType] = useState('2x1');
  const [newPromoValue, setNewPromoValue] = useState('2×1');
  const [newPromoCategory, setNewPromoCategory] = useState('Cocktails');
  const [savedSuccess, setSavedSuccess] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);

  const tenantSlug = negocio?.slug || name.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '') || 'mi-restobar';
  const directUrl = `${window.location.origin}/?negocio=${tenantSlug}`;

  const handleCopyLink = () => {
    navigator.clipboard.writeText(directUrl);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2500);
  };

  useEffect(() => {
    localStorage.setItem('gst_resto_promos', JSON.stringify(promos));
  }, [promos]);

  // Handler de carga de archivos (Logotipo y Portada)
  const handleFileUpload = (e, field) => {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onloadend = () => {
      if (field === 'logo') {
        setLogoUrl(reader.result);
      } else if (field === 'cover') {
        setCoverUrl(reader.result);
      }
    };
    reader.readAsDataURL(file);
  };

  const handleSaveBranding = (e) => {
    e.preventDefault();
    const config = { name, tagline, wifiName, wifiPass, accent, logoUrl, coverUrl };
    localStorage.setItem('gst_resto_branding', JSON.stringify(config));
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 3000);
  };

  const handleAddPromo = (e) => {
    e.preventDefault();
    if (!newPromoName.trim()) return;

    const promo = {
      id: Date.now(),
      name: newPromoName,
      type: newPromoType,
      value: newPromoValue,
      category: newPromoCategory,
      days: ['L','M','X','J','V','S','D'],
      startTime: '18:00',
      endTime: '22:00',
      active: true,
      badge: 'TOP VENTAS'
    };

    setPromos([promo, ...promos]);
    setNewPromoName('');
  };

  const togglePromoActive = (id) => {
    setPromos(promos.map(p => p.id === id ? { ...p, active: !p.active } : p));
  };

  const deletePromo = (id) => {
    setPromos(promos.filter(p => p.id !== id));
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Header del Módulo */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/10 text-amber-600 dark:text-amber-400 text-xs font-bold mb-2 border border-amber-500/20">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Módulo de Personalización & Marketing</span>
          </div>
          <h1 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight">Studio de Marca e Imagen Comercial</h1>
          <p className="text-sm text-slate-500 dark:text-slate-400">Sube el logo de tu local, imagen de portada y configura ofertas automáticas.</p>
        </div>

        {/* Tab Switcher */}
        <div className="flex items-center gap-2 bg-slate-100 dark:bg-slate-950 p-1.5 rounded-xl border border-slate-200 dark:border-slate-800">
          <button
            onClick={() => setActiveTab('branding')}
            className={`px-4 py-2 rounded-lg text-xs font-bold transition-all flex items-center gap-2 ${
              activeTab === 'branding'
                ? 'bg-amber-500 text-slate-950 shadow-md'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <Palette className="w-4 h-4" />
            <span>Identidad & Branding</span>
          </button>
          <button
            onClick={() => setActiveTab('promos')}
            className={`px-4 py-2 rounded-lg text-xs font-bold transition-all flex items-center gap-2 ${
              activeTab === 'promos'
                ? 'bg-amber-500 text-slate-950 shadow-md'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <Tag className="w-4 h-4" />
            <span>Promociones ({promos.filter(p => p.active).length} activas)</span>
          </button>
        </div>
      </div>

      {savedSuccess && (
        <div className="bg-emerald-500/15 border border-emerald-500/30 text-emerald-600 dark:text-emerald-400 px-4 py-3 rounded-xl flex items-center gap-2 text-sm font-bold animate-fade-in">
          <ShieldCheck className="w-5 h-5" />
          <span>¡Imágenes e Identidad guardadas con éxito! Se actualizaron en la carta digital y barra de navegación.</span>
        </div>
      )}

      {/* BANNER DE ENLACE DIRECTO PARA CLIENTES (OPCIÓN A MULTI-TENANT) */}
      <div className="bg-gradient-to-r from-amber-500/15 via-slate-900 to-slate-900 border border-amber-500/30 rounded-2xl p-5 shadow-lg flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-amber-500 text-slate-950 flex items-center justify-center shrink-0 shadow-md">
            <LinkIcon className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <span>Tu Enlace Directo para Clientes (Opción A)</span>
              <span className="bg-amber-500/20 text-amber-400 text-[10px] font-black px-2 py-0.5 rounded border border-amber-500/30 uppercase">URL Multi-Tenant</span>
            </h3>
            <p className="text-xs text-slate-400">Comparte este enlace en Instagram, WhatsApp o Google Maps para dirigir a tus clientes directo a tu local.</p>
          </div>
        </div>

        <div className="flex items-center gap-2 w-full md:w-auto">
          <input
            type="text"
            readOnly
            value={directUrl}
            className="bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-amber-400 font-mono w-full md:w-72 outline-none select-all"
          />
          <button
            onClick={handleCopyLink}
            className={`px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 shrink-0 transition-all ${
              copiedLink
                ? 'bg-emerald-500 text-slate-950 shadow-md'
                : 'bg-amber-500 hover:bg-amber-400 text-slate-950 shadow-md'
            }`}
          >
            {copiedLink ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
            <span>{copiedLink ? '¡Copiado!' : 'Copiar'}</span>
          </button>
        </div>
      </div>

      {/* Main Grid: Form Left, Mockup Right */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Left Column: Forms */}
        <div className="lg:col-span-8 space-y-6">
          
          {/* TAB 1: BRANDING FORM */}
          {activeTab === 'branding' && (
            <form onSubmit={handleSaveBranding} className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 space-y-6 shadow-sm">
              <h2 className="text-lg font-bold text-slate-900 dark:text-white pb-3 border-b border-slate-100 dark:border-slate-800 flex items-center gap-2">
                <Palette className="w-5 h-5 text-amber-500" />
                <span>Logotipo e Imagen Comercial del Local</span>
              </h2>

              {/* SECCIÓN DE CARGA DE IMÁGENES */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 bg-slate-50 dark:bg-slate-950/60 p-4 rounded-2xl border border-slate-200 dark:border-slate-800">
                
                {/* 1. CARGA DE LOGOTIPO */}
                <div className="space-y-3">
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                    <Camera className="w-4 h-4 text-amber-500" />
                    <span>Logotipo del RestoBar</span>
                  </label>

                  <div className="flex items-center gap-4">
                    <div className="w-20 h-20 rounded-2xl bg-slate-200 dark:bg-slate-900 border-2 border-dashed border-amber-500/50 flex items-center justify-center overflow-hidden shrink-0 shadow-inner">
                      {logoUrl ? (
                        <img src={logoUrl} alt="Logo" className="w-full h-full object-cover" />
                      ) : (
                        <Camera className="w-8 h-8 text-slate-400" />
                      )}
                    </div>

                    <div className="space-y-2 flex-1 min-w-0">
                      <label className="inline-flex items-center gap-2 px-3 py-2 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs rounded-xl cursor-pointer shadow transition-all">
                        <Upload className="w-3.5 h-3.5" />
                        <span>Subir Imagen</span>
                        <input
                          type="file"
                          accept="image/*"
                          onChange={(e) => handleFileUpload(e, 'logo')}
                          className="hidden"
                        />
                      </label>

                      <input
                        type="text"
                        placeholder="O pega URL directa..."
                        value={logoUrl}
                        onChange={(e) => setLogoUrl(e.target.value)}
                        className="w-full text-xs px-3 py-1.5 rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white outline-none"
                      />
                    </div>
                  </div>
                </div>

                {/* 2. CARGA DE BANNER / PORTADA */}
                <div className="space-y-3">
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                    <Image className="w-4 h-4 text-amber-500" />
                    <span>Portada / Fondo del Local</span>
                  </label>

                  <div className="space-y-2">
                    <div className="h-20 rounded-2xl bg-slate-200 dark:bg-slate-900 border-2 border-dashed border-amber-500/50 flex items-center justify-center overflow-hidden shadow-inner relative">
                      {coverUrl ? (
                        <img src={coverUrl} alt="Cover" className="w-full h-full object-cover" />
                      ) : (
                        <span className="text-xs text-slate-400 font-medium">Portada por defecto</span>
                      )}

                      <label className="absolute bottom-2 right-2 px-2.5 py-1 bg-slate-950/80 hover:bg-slate-950 text-white font-bold text-[10px] rounded-lg cursor-pointer flex items-center gap-1 backdrop-blur-sm border border-slate-700">
                        <Upload className="w-3 h-3 text-amber-400" />
                        <span>Cambiar</span>
                        <input
                          type="file"
                          accept="image/*"
                          onChange={(e) => handleFileUpload(e, 'cover')}
                          className="hidden"
                        />
                      </label>
                    </div>

                    <input
                      type="text"
                      placeholder="O pega URL directa de portada..."
                      value={coverUrl}
                      onChange={(e) => setCoverUrl(e.target.value)}
                      className="w-full text-xs px-3 py-1.5 rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white outline-none"
                    />
                  </div>
                </div>

              </div>

              {/* CAMPOS DE INFORMACIÓN COMERCIAL */}
              <div className="space-y-4 pt-2">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-400 mb-1">Nombre Comercial del Local</label>
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white font-medium focus:ring-2 focus:ring-amber-500 outline-none text-sm"
                    placeholder="Ej. La Taverna Gastrobar"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-400 mb-1">Eslogan o Mensaje de Bienvenida</label>
                  <input
                    type="text"
                    value={tagline}
                    onChange={(e) => setTagline(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white font-medium focus:ring-2 focus:ring-amber-500 outline-none text-sm"
                    placeholder="Ej. Coctelería de autor y comida artesana"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-400 mb-1">Nombre Red WiFi</label>
                    <input
                      type="text"
                      value={wifiName}
                      onChange={(e) => setWifiName(e.target.value)}
                      className="w-full px-4 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white font-medium focus:ring-2 focus:ring-amber-500 outline-none text-sm"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-400 mb-1">Contraseña WiFi</label>
                    <input
                      type="text"
                      value={wifiPass}
                      onChange={(e) => setWifiPass(e.target.value)}
                      className="w-full px-4 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white font-medium focus:ring-2 focus:ring-amber-500 outline-none text-sm"
                    />
                  </div>
                </div>

                {/* Accent Colors */}
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-400 mb-2">Tema y Color de Acento</label>
                  <div className="grid grid-cols-3 gap-3">
                    {ACCENT_OPTIONS.map((opt) => (
                      <button
                        key={opt.key}
                        type="button"
                        onClick={() => setAccent(opt.key)}
                        className={`p-3 rounded-xl border flex flex-col items-center gap-1.5 transition-all text-xs font-bold ${
                          accent === opt.key
                            ? 'border-amber-500 bg-amber-500/10 text-slate-900 dark:text-white ring-2 ring-amber-500/50'
                            : 'border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 text-slate-600 dark:text-slate-400'
                        }`}
                      >
                        <span className="w-5 h-5 rounded-full shadow-sm" style={{ backgroundColor: opt.color }} />
                        <span>{opt.label}</span>
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              <div className="pt-4 border-t border-slate-100 dark:border-slate-800 flex justify-end">
                <button
                  type="submit"
                  className="px-6 py-2.5 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold rounded-xl shadow-lg shadow-amber-500/20 text-sm transition-all"
                >
                  Guardar Preferencias e Imagenes
                </button>
              </div>
            </form>
          )}

          {/* TAB 2: PROMOTIONS MANAGER */}
          {activeTab === 'promos' && (
            <div className="space-y-6">
              {/* Form de Nueva Promo */}
              <form onSubmit={handleAddPromo} className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 space-y-4 shadow-sm">
                <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
                  <Plus className="w-4 h-4 text-amber-500" />
                  <span>Crear Nueva Promoción u Oferta</span>
                </h3>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                  <div>
                    <label className="block text-[10px] font-bold uppercase text-slate-500 mb-1">Nombre Oferta</label>
                    <input
                      type="text"
                      placeholder="Ej. 2x1 Mojitos"
                      value={newPromoName}
                      onChange={(e) => setNewPromoName(e.target.value)}
                      className="w-full text-xs px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-[10px] font-bold uppercase text-slate-500 mb-1">Tipo de Oferta</label>
                    <select
                      value={newPromoType}
                      onChange={(e) => setNewPromoType(e.target.value)}
                      className="w-full text-xs px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white outline-none"
                    >
                      <option value="2x1">2×1 (Lleva 2 Paga 1)</option>
                      <option value="discount">Descuento (%)</option>
                      <option value="combo">Combo Precio Fijo</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-[10px] font-bold uppercase text-slate-500 mb-1">Valor / Etiqueta</label>
                    <input
                      type="text"
                      placeholder="Ej. 20% o $15"
                      value={newPromoValue}
                      onChange={(e) => setNewPromoValue(e.target.value)}
                      className="w-full text-xs px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-[10px] font-bold uppercase text-slate-500 mb-1">Categoría</label>
                    <input
                      type="text"
                      placeholder="Ej. Cocteles"
                      value={newPromoCategory}
                      onChange={(e) => setNewPromoCategory(e.target.value)}
                      className="w-full text-xs px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white outline-none"
                    />
                  </div>
                </div>

                <div className="flex justify-end pt-2">
                  <button
                    type="submit"
                    className="px-5 py-2 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold rounded-xl text-xs flex items-center gap-1.5 shadow"
                  >
                    <Plus className="w-4 h-4" />
                    <span>Publicar Promoción</span>
                  </button>
                </div>
              </form>

              {/* Lista de Promociones */}
              <div className="space-y-3">
                {promos.map((promo) => (
                  <div
                    key={promo.id}
                    className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 flex items-center justify-between gap-4 shadow-sm"
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <Toggle on={promo.active} onChange={() => togglePromoActive(promo.id)} />
                      <div className="min-w-0">
                        <div className="flex items-center gap-2">
                          <h4 className="text-sm font-bold text-slate-900 dark:text-white truncate">{promo.name}</h4>
                          <TypeBadge type={promo.type} />
                        </div>
                        <p className="text-xs text-slate-500 dark:text-slate-400">
                          Horario: {promo.startTime} - {promo.endTime} hs &bull; Valor: <strong className="text-amber-500">{promo.value}</strong>
                        </p>
                      </div>
                    </div>

                    <button
                      onClick={() => deletePromo(promo.id)}
                      className="p-2 text-slate-400 hover:text-rose-500 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors shrink-0"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

        </div>

        {/* Right Column: Live Phone Mockup Preview */}
        <div className="lg:col-span-4 space-y-4">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 text-center shadow-sm">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-1 flex items-center justify-center gap-1.5">
              <Smartphone className="w-4 h-4 text-amber-500" />
              <span>Simulador en Vivo para Clientes</span>
            </h3>
            <p className="text-[11px] text-slate-400 mb-4">Así se verá tu logo, imagen de portada y promociones al escanear el QR.</p>
            
            <PhoneMockup
              name={name}
              tagline={tagline}
              accent={accent}
              wifiName={wifiName}
              wifiPass={wifiPass}
              promos={promos}
              logoUrl={logoUrl}
              coverUrl={coverUrl}
            />
          </div>
        </div>

      </div>
    </div>
  );
}

export default BrandingAdminView;
