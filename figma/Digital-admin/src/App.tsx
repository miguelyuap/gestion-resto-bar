import { useState, useRef } from "react";

// ── Types ─────────────────────────────────────────────────────────────────────
type AccentKey = "amber" | "emerald" | "rose";
type Tab = "branding" | "promos";
type Day = "L" | "M" | "X" | "J" | "V" | "S" | "D";

interface Promo {
  id: number;
  name: string;
  type: "2x1" | "discount" | "combo";
  value: string;
  category: string;
  days: Day[];
  startTime: string;
  endTime: string;
  active: boolean;
  badge?: string;
}

// ── Constants ─────────────────────────────────────────────────────────────────
const ACCENT_OPTIONS: { key: AccentKey; label: string; color: string; glow: string }[] = [
  { key: "amber",   label: "Golden Amber",  color: "#F59E0B", glow: "rgba(245,158,11,0.35)" },
  { key: "emerald", label: "Emerald Neon",  color: "#10B981", glow: "rgba(16,185,129,0.35)" },
  { key: "rose",    label: "Rose Lounge",   color: "#F43F5E", glow: "rgba(244,63,94,0.35)"  },
];

const ACCENT_HEX: Record<AccentKey, string> = {
  amber: "#F59E0B",
  emerald: "#10B981",
  rose: "#F43F5E",
};

const BADGE_OPTIONS = ["TOP VENTAS", "RECOMENDADO", "ED. LIMITADA", "NUEVO", "CHEF'S PICK"];

const INITIAL_PROMOS: Promo[] = [
  { id: 1, name: "Happy Hour 2x1 Cocktails", type: "2x1",      value: "2×1",  category: "Cocktails", days: ["L","M","X","J","V"], startTime: "18:00", endTime: "21:00", active: true,  badge: "TOP VENTAS" },
  { id: 2, name: "-20% Smash Burgers",       type: "discount", value: "20%",  category: "Burgers",   days: ["V","S","D"],         startTime: "12:00", endTime: "16:00", active: true,  badge: "RECOMENDADO" },
  { id: 3, name: "Combo Pizza + Postre",      type: "combo",    value: "€18",  category: "Varios",    days: ["L","M","X","J","V","S","D"], startTime: "20:00", endTime: "23:59", active: false, badge: undefined },
  { id: 4, name: "-15% Menú Ejecutivo",      type: "discount", value: "15%",  category: "General",   days: ["L","M","X","J","V"], startTime: "13:00", endTime: "15:30", active: true,  badge: "NUEVO" },
];

const ALL_DAYS: Day[] = ["L","M","X","J","V","S","D"];

const NAV_ITEMS = [
  { icon: "⊞", label: "Overview",    id: "overview" },
  { icon: "✦", label: "Branding",    id: "branding" },
  { icon: "◈", label: "Promociones", id: "promos"   },
  { icon: "⋯", label: "Menú",        id: "menu"     },
  { icon: "◷", label: "Reservas",    id: "reservas" },
  { icon: "✦", label: "Analytics",   id: "analytics"},
  { icon: "⊙", label: "Ajustes",     id: "settings" },
];

// ── Helpers ───────────────────────────────────────────────────────────────────
function Toggle({ on, onChange }: { on: boolean; onChange: () => void }) {
  return (
    <button
      onClick={onChange}
      className="relative inline-flex w-11 h-6 rounded-full transition-colors duration-200 focus:outline-none flex-shrink-0"
      style={{ backgroundColor: on ? "#10B981" : "#334155" }}
      aria-checked={on}
      role="switch"
    >
      <span
        className="inline-block w-5 h-5 rounded-full bg-white shadow-md transition-transform duration-200 mt-0.5"
        style={{ transform: on ? "translateX(22px)" : "translateX(2px)" }}
      />
    </button>
  );
}

function BadgePill({ text, accent }: { text: string; accent: AccentKey }) {
  const colors: Record<AccentKey, string> = {
    amber:   "bg-amber-500/15 text-amber-400 border-amber-500/30",
    emerald: "bg-emerald-500/15 text-emerald-400 border-emerald-500/30",
    rose:    "bg-rose-500/15 text-rose-400 border-rose-500/30",
  };
  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded-md text-[10px] font-700 border ${colors[accent]}`}>
      {text}
    </span>
  );
}

function TypeBadge({ type }: { type: Promo["type"] }) {
  const map = {
    "2x1":      "bg-violet-500/20 text-violet-300",
    discount: "bg-blue-500/20 text-blue-300",
    combo:    "bg-teal-500/20 text-teal-300",
  };
  const label = { "2x1": "2×1", discount: "Descuento", combo: "Combo" };
  return (
    <span className={`px-2 py-0.5 rounded text-[10px] font-600 ${map[type]}`}>{label[type]}</span>
  );
}

// ── Phone Mockup ──────────────────────────────────────────────────────────────
function PhoneMockup({
  name,
  tagline,
  accent,
  instagram,
}: {
  name: string;
  tagline: string;
  accent: AccentKey;
  instagram: string;
}) {
  const accentHex = ACCENT_HEX[accent];
  return (
    <div
      className="relative mx-auto"
      style={{ width: 220, height: 430 }}
    >
      {/* Phone frame */}
      <div
        className="absolute inset-0 rounded-[40px] border-[6px] border-slate-600 bg-slate-900 overflow-hidden shadow-[0_20px_60px_rgba(0,0,0,0.6)]"
      >
        {/* Status bar */}
        <div className="flex items-center justify-between px-4 pt-3 pb-1">
          <span className="text-[9px] text-white/50 font-600">9:41</span>
          <div className="w-16 h-3 bg-slate-800 rounded-full" />
          <div className="flex gap-0.5 items-center">
            <div className="w-2 h-1.5 bg-white/40 rounded-[1px]" />
            <div className="w-1 h-1 bg-white/40 rounded-full" />
          </div>
        </div>

        {/* Hero */}
        <div
          className="relative h-28 flex items-end p-3"
          style={{ background: `linear-gradient(135deg, #1e293b 0%, #0f172a 100%)` }}
        >
          <div
            className="absolute inset-0 opacity-20"
            style={{ background: `radial-gradient(circle at 70% 30%, ${accentHex}, transparent 60%)` }}
          />
          <div className="relative z-10 flex items-end gap-2">
            <div
              className="w-9 h-9 rounded-xl flex items-center justify-center text-lg flex-shrink-0"
              style={{ backgroundColor: accentHex, boxShadow: `0 4px 12px ${accentHex}60` }}
            >
              🔥
            </div>
            <div>
              <p className="text-white font-800 text-xs leading-tight truncate" style={{ maxWidth: 120 }}>
                {name || "Tu Restaurante"}
              </p>
              <p className="text-white/50 text-[9px] truncate" style={{ maxWidth: 120 }}>
                {tagline || "Tu tagline aquí"}
              </p>
              <div className="flex gap-1 mt-1">
                <span className="text-[8px] font-600 px-1.5 py-0.5 rounded-full bg-emerald-500/80 text-white">● Abierto</span>
              </div>
            </div>
          </div>
        </div>

        {/* Promo strip */}
        <div className="px-2 py-1.5" style={{ backgroundColor: `${accentHex}18` }}>
          <p className="text-[9px] font-600" style={{ color: accentHex }}>🍹 Happy Hour 2x1 · hasta las 9 PM</p>
        </div>

        {/* Category pills */}
        <div className="flex gap-1 px-2 py-2 overflow-hidden">
          {["Todos","Burgers","Cocktails","Pizzas"].map((c, i) => (
            <span
              key={c}
              className="flex-shrink-0 px-2 py-0.5 rounded-full text-[8px] font-600"
              style={i === 0
                ? { backgroundColor: accentHex, color: "#0f172a" }
                : { backgroundColor: "#1e293b", color: "#94a3b8" }}
            >
              {c}
            </span>
          ))}
        </div>

        {/* Mini cards */}
        {[
          { name: "Smash Burger", price: "€12.90", badge: "-20%" },
          { name: "Negroni Fumado", price: "€10.50", badge: "2×1" },
        ].map((item) => (
          <div key={item.name} className="mx-2 mb-2 flex gap-2 p-2 rounded-xl bg-slate-800">
            <div className="w-10 h-10 rounded-lg bg-slate-700 flex-shrink-0 flex items-center justify-center text-base">🍔</div>
            <div className="flex-1 min-w-0">
              <p className="text-white text-[9px] font-600 truncate">{item.name}</p>
              <p className="text-slate-400 text-[8px] mt-0.5">Descripción breve del plato...</p>
              <div className="flex items-center justify-between mt-1">
                <span className="text-[9px] font-700" style={{ color: accentHex }}>{item.price}</span>
                <span
                  className="text-[7px] font-700 px-1 py-0.5 rounded text-white"
                  style={{ backgroundColor: accentHex }}
                >{item.badge}</span>
              </div>
            </div>
          </div>
        ))}

        {/* Instagram */}
        {instagram && (
          <div className="mx-2 flex items-center gap-1">
            <span className="text-[8px] text-slate-500">📸 @{instagram}</span>
          </div>
        )}

        {/* Bottom cart bar */}
        <div
          className="absolute bottom-0 left-0 right-0 flex items-center justify-between px-3 py-2"
          style={{ backgroundColor: "#0f172a", borderTop: `1px solid ${accentHex}30` }}
        >
          <div className="flex items-center gap-1">
            <span className="text-base">🛒</span>
            <span className="text-white text-[9px] font-700">2 items</span>
          </div>
          <span
            className="text-[9px] font-800 px-3 py-1 rounded-lg text-slate-900"
            style={{ backgroundColor: accentHex }}
          >Ver Pedido</span>
        </div>
      </div>

      {/* Notch */}
      <div className="absolute top-[6px] left-1/2 -translate-x-1/2 w-20 h-4 bg-slate-600 rounded-b-2xl z-10" />

      {/* Side buttons */}
      <div className="absolute left-[-8px] top-20 w-1.5 h-8 bg-slate-600 rounded-l-sm" />
      <div className="absolute left-[-8px] top-32 w-1.5 h-6 bg-slate-600 rounded-l-sm" />
      <div className="absolute right-[-8px] top-24 w-1.5 h-10 bg-slate-600 rounded-r-sm" />
    </div>
  );
}

// ── Branding Studio ───────────────────────────────────────────────────────────
function BrandingStudio({ accent }: { accent: AccentKey }) {
  const [name, setName] = useState("Ember & Rye");
  const [tagline, setTagline] = useState("Sabor que enciente la noche");
  const [instagram, setInstagram] = useState("ember.and.rye");
  const [whatsapp, setWhatsapp] = useState("+34 612 345 678");
  const [ssid, setSsid] = useState("Ember_Guest");
  const [wifiPass, setWifiPass] = useState("ember2024");
  const [selectedAccent, setSelectedAccent] = useState<AccentKey>(accent);
  const logoRef = useRef<HTMLInputElement>(null);
  const heroRef = useRef<HTMLInputElement>(null);
  const [logoName, setLogoName] = useState<string | null>(null);
  const [heroName, setHeroName] = useState<string | null>(null);

  const accentHex = ACCENT_HEX[selectedAccent];

  return (
    <div className="flex gap-6 h-full">
      {/* Left form */}
      <div className="flex-1 overflow-y-auto space-y-5 pr-1">

        {/* Upload row */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-600 text-slate-400 mb-1.5">Logo del Restaurante</label>
            <button
              onClick={() => logoRef.current?.click()}
              className="w-full flex flex-col items-center justify-center gap-1.5 h-24 rounded-xl border border-dashed border-slate-600 hover:border-slate-400 transition-colors bg-slate-800/50 text-slate-400 hover:text-slate-300 text-xs font-500"
            >
              <span className="text-2xl">⬆</span>
              {logoName ? (
                <span className="text-xs text-emerald-400 truncate px-2 text-center">{logoName}</span>
              ) : (
                <span>Subir logo</span>
              )}
            </button>
            <input ref={logoRef} type="file" accept="image/*" className="hidden" onChange={e => setLogoName(e.target.files?.[0]?.name ?? null)} />
          </div>
          <div>
            <label className="block text-xs font-600 text-slate-400 mb-1.5">Hero Cover</label>
            <button
              onClick={() => heroRef.current?.click()}
              className="w-full flex flex-col items-center justify-center gap-1.5 h-24 rounded-xl border border-dashed border-slate-600 hover:border-slate-400 transition-colors bg-slate-800/50 text-slate-400 hover:text-slate-300 text-xs font-500"
            >
              <span className="text-2xl">🖼</span>
              {heroName ? (
                <span className="text-xs text-emerald-400 truncate px-2 text-center">{heroName}</span>
              ) : (
                <span>Subir imagen</span>
              )}
            </button>
            <input ref={heroRef} type="file" accept="image/*" className="hidden" onChange={e => setHeroName(e.target.files?.[0]?.name ?? null)} />
          </div>
        </div>

        {/* Accent color */}
        <div>
          <label className="block text-xs font-600 text-slate-400 mb-2">Color Acento del Tema</label>
          <div className="flex gap-3">
            {ACCENT_OPTIONS.map((opt) => (
              <button
                key={opt.key}
                onClick={() => setSelectedAccent(opt.key)}
                className={`flex-1 flex items-center gap-2 px-3 py-2.5 rounded-xl border transition-all duration-150 ${
                  selectedAccent === opt.key
                    ? "border-transparent ring-2"
                    : "border-slate-700 hover:border-slate-500"
                } bg-slate-800/60`}
                style={selectedAccent === opt.key ? { ringColor: opt.color, boxShadow: `0 0 0 2px ${opt.color}` } : {}}
              >
                <span
                  className="w-4 h-4 rounded-full flex-shrink-0"
                  style={{ backgroundColor: opt.color, boxShadow: selectedAccent === opt.key ? `0 0 8px ${opt.glow}` : undefined }}
                />
                <span className="text-xs font-600 text-slate-300">{opt.label}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Text fields */}
        <div className="space-y-3">
          <FormField label="Nombre del Restaurante" value={name} onChange={setName} placeholder="Ej. Ember & Rye" accent={accentHex} />
          <FormField label="Tagline de Bienvenida" value={tagline} onChange={setTagline} placeholder="Ej. Sabor que enciende la noche" accent={accentHex} />
        </div>

        {/* Social / WiFi */}
        <div>
          <p className="text-xs font-700 text-slate-400 uppercase tracking-widest mb-3">Redes Sociales</p>
          <div className="space-y-3">
            <FormField label="Instagram" value={instagram} onChange={setInstagram} placeholder="@turestaurante" prefix="instagram.com/" accent={accentHex} />
            <FormField label="WhatsApp" value={whatsapp} onChange={setWhatsapp} placeholder="+34 600 000 000" prefix="📱" accent={accentHex} />
          </div>
        </div>

        <div>
          <p className="text-xs font-700 text-slate-400 uppercase tracking-widest mb-3">Credenciales Wi-Fi</p>
          <div className="grid grid-cols-2 gap-3">
            <FormField label="SSID / Red" value={ssid} onChange={setSsid} placeholder="Nombre de red" accent={accentHex} />
            <FormField label="Contraseña" value={wifiPass} onChange={setWifiPass} placeholder="••••••••" accent={accentHex} />
          </div>
        </div>

        {/* Save button */}
        <button
          className="w-full py-3 rounded-xl font-700 text-sm text-slate-900 transition-all hover:opacity-90 active:scale-[0.98]"
          style={{ backgroundColor: accentHex, boxShadow: `0 4px 20px ${ACCENT_OPTIONS.find(a => a.key === selectedAccent)!.glow}` }}
        >
          Guardar Cambios
        </button>
      </div>

      {/* Right: phone mockup */}
      <div className="w-64 flex-shrink-0 flex flex-col items-center gap-4">
        <div className="w-full flex items-center justify-between px-1">
          <p className="text-xs font-600 text-slate-400">Vista previa en vivo</p>
          <span className="flex items-center gap-1 text-[10px] text-emerald-400 font-600">
            <span className="w-1.5 h-1.5 bg-emerald-400 rounded-full animate-pulse" />
            Live
          </span>
        </div>
        <PhoneMockup name={name} tagline={tagline} accent={selectedAccent} instagram={instagram} />
        <p className="text-[10px] text-slate-500 text-center">Los cambios se reflejan en tiempo real en el menú del cliente</p>
      </div>
    </div>
  );
}

function FormField({
  label, value, onChange, placeholder, prefix, accent,
}: {
  label: string; value: string; onChange: (v: string) => void; placeholder?: string; prefix?: string; accent: string;
}) {
  return (
    <div>
      <label className="block text-xs font-600 text-slate-400 mb-1.5">{label}</label>
      <div className="relative flex items-center">
        {prefix && (
          <span className="absolute left-3 text-xs text-slate-500 select-none">{prefix}</span>
        )}
        <input
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          className="w-full bg-slate-800/60 border border-slate-700 rounded-xl px-3 py-2.5 text-sm text-slate-200 placeholder-slate-600 outline-none transition-all focus:border-transparent"
          style={{ paddingLeft: prefix ? (prefix.length > 3 ? "7rem" : "2.5rem") : "0.75rem" }}
          onFocus={e => { e.currentTarget.style.boxShadow = `0 0 0 2px ${accent}60`; e.currentTarget.style.borderColor = accent; }}
          onBlur={e => { e.currentTarget.style.boxShadow = "none"; e.currentTarget.style.borderColor = "#334155"; }}
        />
      </div>
    </div>
  );
}

// ── Promotions Engine ─────────────────────────────────────────────────────────
function PromosEngine({ accent }: { accent: AccentKey }) {
  const [promos, setPromos] = useState<Promo[]>(INITIAL_PROMOS);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [showNew, setShowNew] = useState(false);

  const accentHex = ACCENT_HEX[accent];

  function toggleActive(id: number) {
    setPromos(prev => prev.map(p => p.id === id ? { ...p, active: !p.active } : p));
  }

  function setBadge(id: number, badge: string | undefined) {
    setPromos(prev => prev.map(p => p.id === id ? { ...p, badge } : p));
  }

  function toggleDay(id: number, day: Day) {
    setPromos(prev => prev.map(p => {
      if (p.id !== id) return p;
      const has = p.days.includes(day);
      return { ...p, days: has ? p.days.filter(d => d !== day) : [...p.days, day] };
    }));
  }

  return (
    <div className="space-y-5">
      {/* Header row */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-sm font-700 text-slate-200">Promociones Activas</h3>
          <p className="text-xs text-slate-500 mt-0.5">{promos.filter(p => p.active).length} de {promos.length} activas</p>
        </div>
        <button
          onClick={() => setShowNew(!showNew)}
          className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-700 text-slate-900 transition-all hover:opacity-90"
          style={{ backgroundColor: accentHex }}
        >
          + Nueva Promo
        </button>
      </div>

      {/* New promo quick form */}
      {showNew && (
        <div className="p-4 rounded-2xl border border-dashed border-slate-600 bg-slate-800/40 space-y-3">
          <p className="text-xs font-700 text-slate-300 uppercase tracking-widest">Nueva Promoción</p>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs text-slate-500 mb-1">Nombre</label>
              <input className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-xs text-slate-200 outline-none" placeholder="Ej. Happy Hour..." />
            </div>
            <div>
              <label className="block text-xs text-slate-500 mb-1">Tipo</label>
              <select className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-xs text-slate-200 outline-none">
                <option value="2x1">2×1</option>
                <option value="discount">Descuento %</option>
                <option value="combo">Combo</option>
              </select>
            </div>
          </div>
          <div className="flex gap-2 justify-end">
            <button onClick={() => setShowNew(false)} className="px-3 py-1.5 text-xs font-600 text-slate-400 hover:text-slate-200">Cancelar</button>
            <button
              onClick={() => setShowNew(false)}
              className="px-4 py-1.5 rounded-lg text-xs font-700 text-slate-900"
              style={{ backgroundColor: accentHex }}
            >Crear</button>
          </div>
        </div>
      )}

      {/* Promos table/cards */}
      <div className="space-y-3">
        {promos.map((promo) => (
          <div
            key={promo.id}
            className={`rounded-2xl border transition-all duration-200 ${
              promo.active
                ? "border-slate-700 bg-slate-800/60"
                : "border-slate-700/50 bg-slate-800/30 opacity-60"
            }`}
          >
            {/* Main row */}
            <div className="flex items-center gap-4 p-4">
              <Toggle on={promo.active} onChange={() => toggleActive(promo.id)} />

              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <p className="text-sm font-700 text-slate-200 leading-tight">{promo.name}</p>
                  <TypeBadge type={promo.type} />
                  {promo.badge && <BadgePill text={promo.badge} accent={accent} />}
                </div>
                <div className="flex items-center gap-3 mt-1.5 text-xs text-slate-500 flex-wrap">
                  <span>📂 {promo.category}</span>
                  <span>⏱ {promo.startTime} – {promo.endTime}</span>
                  <span className="flex gap-0.5">
                    {ALL_DAYS.map(d => (
                      <span
                        key={d}
                        className={`w-4 h-4 rounded text-[9px] font-700 flex items-center justify-center ${
                          promo.days.includes(d)
                            ? "text-slate-900"
                            : "text-slate-600 bg-slate-700/50"
                        }`}
                        style={promo.days.includes(d) ? { backgroundColor: accentHex } : {}}
                      >
                        {d}
                      </span>
                    ))}
                  </span>
                </div>
              </div>

              <div className="flex items-center gap-2 flex-shrink-0">
                <span
                  className="text-base font-800"
                  style={{ color: accentHex }}
                >
                  {promo.value}
                </span>
                <button
                  onClick={() => setEditingId(editingId === promo.id ? null : promo.id)}
                  className="w-8 h-8 rounded-lg bg-slate-700 hover:bg-slate-600 flex items-center justify-center text-slate-400 hover:text-slate-200 transition-colors text-sm"
                >
                  ✎
                </button>
              </div>
            </div>

            {/* Expanded editor */}
            {editingId === promo.id && (
              <div className="px-4 pb-4 pt-0 border-t border-slate-700 mt-0 space-y-4">
                <p className="text-xs font-700 text-slate-400 uppercase tracking-widest pt-3">Configuración</p>

                {/* Day picker */}
                <div>
                  <label className="block text-xs text-slate-500 mb-2">Días Activos</label>
                  <div className="flex gap-1.5">
                    {ALL_DAYS.map(d => (
                      <button
                        key={d}
                        onClick={() => toggleDay(promo.id, d)}
                        className="w-8 h-8 rounded-lg text-xs font-700 transition-all"
                        style={
                          promo.days.includes(d)
                            ? { backgroundColor: accentHex, color: "#0f172a" }
                            : { backgroundColor: "#1e293b", color: "#64748b" }
                        }
                      >
                        {d}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Time */}
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs text-slate-500 mb-1.5">Hora inicio</label>
                    <input
                      type="time"
                      defaultValue={promo.startTime}
                      onChange={e => setPromos(prev => prev.map(p => p.id === promo.id ? { ...p, startTime: e.target.value } : p))}
                      className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-sm text-slate-200 outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-xs text-slate-500 mb-1.5">Hora fin</label>
                    <input
                      type="time"
                      defaultValue={promo.endTime}
                      onChange={e => setPromos(prev => prev.map(p => p.id === promo.id ? { ...p, endTime: e.target.value } : p))}
                      className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-sm text-slate-200 outline-none"
                    />
                  </div>
                </div>

                {/* Badge selector */}
                <div>
                  <label className="block text-xs text-slate-500 mb-2">Badge de Visibilidad</label>
                  <div className="flex flex-wrap gap-2">
                    {BADGE_OPTIONS.map((b) => (
                      <button
                        key={b}
                        onClick={() => setBadge(promo.id, promo.badge === b ? undefined : b)}
                        className="px-3 py-1.5 rounded-lg text-xs font-700 border transition-all"
                        style={
                          promo.badge === b
                            ? { backgroundColor: accentHex, color: "#0f172a", borderColor: accentHex }
                            : { backgroundColor: "transparent", color: "#64748b", borderColor: "#334155" }
                        }
                      >
                        {b}
                      </button>
                    ))}
                    {promo.badge && (
                      <button
                        onClick={() => setBadge(promo.id, undefined)}
                        className="px-3 py-1.5 rounded-lg text-xs font-600 text-rose-400 border border-rose-500/30 hover:bg-rose-500/10 transition-colors"
                      >
                        Quitar badge
                      </button>
                    )}
                  </div>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Stats row */}
      <div className="grid grid-cols-3 gap-3 pt-2">
        {[
          { label: "Impresiones hoy", value: "2,847", delta: "+12%" },
          { label: "Conversión promos", value: "34.2%", delta: "+5.1%" },
          { label: "Revenue promo", value: "€1,204", delta: "+18%" },
        ].map((s) => (
          <div key={s.label} className="p-4 rounded-2xl bg-slate-800/60 border border-slate-700">
            <p className="text-xs text-slate-500 font-500">{s.label}</p>
            <p className="text-xl font-800 text-slate-100 mt-1">{s.value}</p>
            <p className="text-xs font-600 text-emerald-400 mt-0.5">{s.delta} esta semana</p>
          </div>
        ))}
      </div>
    </div>
  );
}

// ── Main App ──────────────────────────────────────────────────────────────────
export default function App() {
  const [activeNav, setActiveNav] = useState<string>("branding");
  const [tab, setTab] = useState<Tab>("branding");
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const accent: AccentKey = "amber";
  const accentHex = ACCENT_HEX[accent];

  function handleNav(id: string) {
    setActiveNav(id);
    if (id === "branding" || id === "promos") setTab(id as Tab);
    setSidebarOpen(false);
  }

  return (
    <div
      className="flex h-full bg-slate-950 text-slate-100 overflow-hidden"
      style={{ fontFamily: "'Inter', 'Plus Jakarta Sans', system-ui, sans-serif" }}
    >
      {/* ── Sidebar ──────────────────────────────────────────────────────── */}
      {/* Mobile overlay */}
      {sidebarOpen && (
        <div className="fixed inset-0 z-20 bg-black/60 lg:hidden" onClick={() => setSidebarOpen(false)} />
      )}

      <aside
        className={`
          fixed lg:static inset-y-0 left-0 z-30
          flex flex-col w-16 bg-slate-900 border-r border-slate-800
          transition-transform duration-300
          ${sidebarOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"}
        `}
      >
        {/* Logo mark */}
        <div className="flex items-center justify-center h-14 border-b border-slate-800">
          <div
            className="w-9 h-9 rounded-xl flex items-center justify-center text-lg font-800 text-slate-900"
            style={{ backgroundColor: accentHex, boxShadow: `0 0 16px ${accentHex}50` }}
          >
            🔥
          </div>
        </div>

        {/* Nav icons */}
        <nav className="flex-1 flex flex-col items-center gap-1 py-3">
          {NAV_ITEMS.map((item) => {
            const isActive = activeNav === item.id;
            return (
              <button
                key={item.id}
                onClick={() => handleNav(item.id)}
                title={item.label}
                className={`
                  group relative w-10 h-10 rounded-xl flex items-center justify-center
                  text-base transition-all duration-150
                  ${isActive ? "text-slate-900" : "text-slate-500 hover:text-slate-300 hover:bg-slate-800"}
                `}
                style={isActive ? { backgroundColor: accentHex, boxShadow: `0 2px 12px ${accentHex}50` } : {}}
              >
                <span>{item.icon}</span>
                {/* Tooltip */}
                <span className="absolute left-full ml-2 px-2 py-1 rounded-lg bg-slate-800 text-slate-200 text-xs font-600 whitespace-nowrap opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity z-50 border border-slate-700">
                  {item.label}
                </span>
              </button>
            );
          })}
        </nav>

        {/* Avatar */}
        <div className="flex items-center justify-center pb-4">
          <div className="w-9 h-9 rounded-full bg-gradient-to-br from-slate-600 to-slate-700 flex items-center justify-center text-sm font-700 text-slate-300 border border-slate-700">
            A
          </div>
        </div>
      </aside>

      {/* ── Main Content ─────────────────────────────────────────────────── */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">

        {/* Top bar */}
        <header className="flex items-center justify-between h-14 px-5 border-b border-slate-800 bg-slate-950 flex-shrink-0">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="lg:hidden w-8 h-8 flex items-center justify-center text-slate-400 hover:text-slate-200"
            >
              ☰
            </button>
            <div>
              <p className="text-sm font-700 text-slate-200">Customer Experience</p>
              <p className="text-xs text-slate-500">Ember & Rye · Mesa 12 · Admin</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            {/* Status */}
            <div className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/20">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
              <span className="text-xs font-600 text-emerald-400">Menú Online</span>
            </div>
            <button className="w-8 h-8 rounded-xl bg-slate-800 border border-slate-700 flex items-center justify-center text-slate-400 hover:text-slate-200 text-sm">
              🔔
            </button>
            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-amber-400 to-amber-600 flex items-center justify-center text-xs font-800 text-slate-900">
              A
            </div>
          </div>
        </header>

        {/* Tabs */}
        <div className="flex items-center gap-1 px-5 py-3 border-b border-slate-800 bg-slate-950 flex-shrink-0">
          {[
            { id: "branding" as Tab, label: "✦ Branding Studio", desc: "Identidad visual" },
            { id: "promos" as Tab,   label: "◈ Promotions Engine", desc: "Ofertas y Happy Hour" },
          ].map((t) => {
            const isActive = tab === t.id;
            return (
              <button
                key={t.id}
                onClick={() => { setTab(t.id); setActiveNav(t.id); }}
                className={`
                  flex items-center gap-2 px-4 py-2 rounded-xl text-sm transition-all duration-150
                  ${isActive
                    ? "font-700 text-slate-900"
                    : "font-500 text-slate-500 hover:text-slate-300 hover:bg-slate-800"
                  }
                `}
                style={isActive ? { backgroundColor: accentHex, boxShadow: `0 2px 12px ${accentHex}40` } : {}}
              >
                <span>{t.label}</span>
                {isActive && <span className="hidden sm:inline text-[10px] opacity-70">· {t.desc}</span>}
              </button>
            );
          })}

          {/* Spacer / breadcrumb */}
          <div className="flex-1" />
          <div className="hidden md:flex items-center gap-2 text-xs text-slate-600">
            <span>Dashboard</span>
            <span>/</span>
            <span className="text-slate-400">{tab === "branding" ? "Branding Studio" : "Promotions Engine"}</span>
          </div>
        </div>

        {/* Content area */}
        <main className="flex-1 overflow-y-auto p-5">
          {tab === "branding" ? (
            <BrandingStudio accent={accent} />
          ) : (
            <PromosEngine accent={accent} />
          )}
        </main>
      </div>
    </div>
  );
}
