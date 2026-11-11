import { useState, useEffect, useRef } from "react";

// ── Types ─────────────────────────────────────────────────────────────────────
type Status = "free" | "occupied" | "bill" | "dirty";
type Zone = "all" | "sala" | "terraza" | "barra";
type Shape = "square" | "round" | "rect";

interface OrderItem {
  name: string;
  qty: number;
  price: number;
}

interface Table {
  id: number;
  label: string;
  zone: "sala" | "terraza" | "barra";
  seats: number;
  shape: Shape;
  status: Status;
  waiter?: string;
  since?: number; // epoch ms when order started
  items?: OrderItem[];
  covers?: number;
  note?: string;
}

// ── Status config ─────────────────────────────────────────────────────────────
const STATUS_CFG = {
  free:     { label: "Libre",      color: "#22C55E", bg: "rgba(34,197,94,0.12)",   ring: "rgba(34,197,94,0.35)",  icon: "✓" },
  occupied: { label: "Ocupada",    color: "#F59E0B", bg: "rgba(245,158,11,0.12)",  ring: "rgba(245,158,11,0.35)", icon: "●" },
  bill:     { label: "Pre-cuenta", color: "#3B82F6", bg: "rgba(59,130,246,0.12)",  ring: "rgba(59,130,246,0.35)", icon: "₿" },
  dirty:    { label: "Limpieza",   color: "#EF4444", bg: "rgba(239,68,68,0.12)",   ring: "rgba(239,68,68,0.35)",  icon: "!" },
} as const;

// ── Now helper ────────────────────────────────────────────────────────────────
const NOW = Date.now();
const ago = (min: number) => NOW - min * 60 * 1000;

// ── Initial data ──────────────────────────────────────────────────────────────
const INITIAL_TABLES: Table[] = [
  // Sala principal
  { id: 1,  label: "T-01", zone: "sala",    seats: 4, shape: "square",  status: "occupied", waiter: "Carlos",  since: ago(42), covers: 3, items: [{ name: "Smash Burger x2", qty: 2, price: 12.9 }, { name: "Negroni", qty: 1, price: 10.5 }, { name: "Agua",  qty: 2, price: 2.5 }] },
  { id: 2,  label: "T-02", zone: "sala",    seats: 2, shape: "round",   status: "bill",     waiter: "Laura",   since: ago(78), covers: 2, items: [{ name: "Pizza Trufa", qty: 1, price: 16.9 }, { name: "Espresso Martini x2", qty: 2, price: 11.0 }] },
  { id: 3,  label: "T-03", zone: "sala",    seats: 4, shape: "square",  status: "free" },
  { id: 4,  label: "T-04", zone: "sala",    seats: 6, shape: "rect",    status: "occupied", waiter: "Carlos",  since: ago(15), covers: 5, items: [{ name: "Diavola", qty: 2, price: 14.5 }, { name: "Margarita x3", qty: 3, price: 9.5 }] },
  { id: 5,  label: "T-05", zone: "sala",    seats: 4, shape: "square",  status: "dirty",    note: "Mesa VIP — necesita limpieza urgente" },
  { id: 6,  label: "T-06", zone: "sala",    seats: 2, shape: "round",   status: "free" },
  { id: 7,  label: "T-07", zone: "sala",    seats: 8, shape: "rect",    status: "occupied", waiter: "Laura",   since: ago(55), covers: 7, items: [{ name: "Smash BBQ x4", qty: 4, price: 14.9 }, { name: "Volcán Choc x3", qty: 3, price: 8.5 }, { name: "Cocktails mix x6", qty: 6, price: 10.0 }] },
  { id: 8,  label: "T-08", zone: "sala",    seats: 4, shape: "square",  status: "free" },
  { id: 9,  label: "T-09", zone: "sala",    seats: 2, shape: "round",   status: "bill",     waiter: "Marco",   since: ago(91), covers: 2, items: [{ name: "Tiramisú x2", qty: 2, price: 7.9 }, { name: "Rum Old Fashioned x2", qty: 2, price: 12.0 }] },
  { id: 10, label: "T-10", zone: "sala",    seats: 4, shape: "square",  status: "occupied", waiter: "Marco",   since: ago(28), covers: 4, items: [{ name: "Crispy Chicken", qty: 2, price: 13.5 }, { name: "Fries x2", qty: 2, price: 4.0 }] },
  // Terraza
  { id: 11, label: "TE-1", zone: "terraza", seats: 4, shape: "square",  status: "free" },
  { id: 12, label: "TE-2", zone: "terraza", seats: 4, shape: "square",  status: "occupied", waiter: "Ana",     since: ago(22), covers: 3, items: [{ name: "Burrata Trufa", qty: 1, price: 16.9 }, { name: "Negroni x2", qty: 2, price: 10.5 }] },
  { id: 13, label: "TE-3", zone: "terraza", seats: 6, shape: "rect",    status: "dirty",    note: "Spill — solicitar limpieza" },
  { id: 14, label: "TE-4", zone: "terraza", seats: 4, shape: "square",  status: "free" },
  { id: 15, label: "TE-5", zone: "terraza", seats: 2, shape: "round",   status: "occupied", waiter: "Ana",     since: ago(8),  covers: 2, items: [{ name: "Veggie Smash", qty: 1, price: 12.0 }] },
  // Barra
  { id: 16, label: "B-01", zone: "barra",   seats: 2, shape: "round",   status: "occupied", waiter: "Marco",   since: ago(5),  covers: 1, items: [{ name: "Espresso Martini", qty: 1, price: 11.0 }] },
  { id: 17, label: "B-02", zone: "barra",   seats: 2, shape: "round",   status: "free" },
  { id: 18, label: "B-03", zone: "barra",   seats: 2, shape: "round",   status: "bill",     waiter: "Carlos",  since: ago(34), covers: 2, items: [{ name: "Rum Old Fashioned x2", qty: 2, price: 12.0 }] },
  { id: 19, label: "B-04", zone: "barra",   seats: 2, shape: "round",   status: "free" },
  { id: 20, label: "B-05", zone: "barra",   seats: 2, shape: "round",   status: "occupied", waiter: "Laura",   since: ago(19), covers: 2, items: [{ name: "Margarita Passion x2", qty: 2, price: 9.5 }, { name: "Nachos", qty: 1, price: 6.0 }] },
];

const QUICK_ACTIONS = [
  { id: "order",   icon: "📋", label: "Tomar Pedido",       color: "#F59E0B" },
  { id: "add",     icon: "➕", label: "Agregar Producto",   color: "#22C55E" },
  { id: "bill",    icon: "🧾", label: "Imprimir Pre-cuenta",color: "#3B82F6" },
  { id: "move",    icon: "↔",  label: "Cambiar de Mesa",    color: "#A78BFA" },
  { id: "clean",   icon: "🧹", label: "Solicitar Limpieza", color: "#EF4444" },
  { id: "reserve", icon: "🔒", label: "Reservar Mesa",      color: "#64748B" },
];

// ── Utils ─────────────────────────────────────────────────────────────────────
function elapsed(since?: number): string {
  if (!since) return "—";
  const m = Math.floor((Date.now() - since) / 60000);
  if (m < 60) return `${m}m`;
  return `${Math.floor(m / 60)}h ${m % 60}m`;
}

function totalAmount(items?: OrderItem[]): number {
  return (items ?? []).reduce((s, i) => s + i.qty * i.price, 0);
}

function urgency(since?: number): "low" | "mid" | "high" {
  if (!since) return "low";
  const m = (Date.now() - since) / 60000;
  if (m > 60) return "high";
  if (m > 30) return "mid";
  return "low";
}

// ── Clock ─────────────────────────────────────────────────────────────────────
function Clock() {
  const [time, setTime] = useState(new Date());
  useEffect(() => {
    const t = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(t);
  }, []);
  return (
    <span className="font-mono tabular-nums text-slate-300 text-sm font-600">
      {time.toLocaleTimeString("es-ES", { hour: "2-digit", minute: "2-digit", second: "2-digit" })}
    </span>
  );
}

// ── Table Card ────────────────────────────────────────────────────────────────
function TableCard({
  table, selected, onClick,
}: {
  table: Table; selected: boolean; onClick: () => void;
}) {
  const cfg = STATUS_CFG[table.status];
  const total = totalAmount(table.items);
  const urg = urgency(table.since);
  const isRect = table.shape === "rect";

  return (
    <button
      onClick={onClick}
      className={`relative flex flex-col justify-between rounded-2xl p-3 transition-all duration-150 active:scale-[0.96] select-none text-left ${isRect ? "col-span-2" : ""}`}
      style={{
        backgroundColor: selected ? cfg.bg : "rgba(30,41,59,0.7)",
        border: selected
          ? `2px solid ${cfg.color}`
          : `1.5px solid rgba(51,65,85,${table.status === "free" ? "0.5" : "0.8"})`,
        boxShadow: selected
          ? `0 0 0 3px ${cfg.ring}, 0 8px 24px rgba(0,0,0,0.4)`
          : "0 2px 8px rgba(0,0,0,0.3)",
        minHeight: isRect ? 100 : 90,
      }}
    >
      {/* Status dot */}
      <div className="flex items-start justify-between">
        <span className="text-xs font-800 text-slate-200 leading-none">{table.label}</span>
        <span
          className="w-2.5 h-2.5 rounded-full flex-shrink-0 mt-0.5"
          style={{
            backgroundColor: cfg.color,
            boxShadow: `0 0 6px ${cfg.color}`,
            animation: table.status === "bill" ? "pulse 1.5s infinite" : undefined,
          }}
        />
      </div>

      {/* Center info */}
      <div className="flex-1 flex items-center justify-center py-1">
        {table.status === "free" ? (
          <span className="text-2xl opacity-20">⊡</span>
        ) : (
          <div className="text-center">
            <p className="text-base font-800 tabular-nums" style={{ color: cfg.color }}>
              {table.status === "dirty" ? "!" : `€${total.toFixed(0)}`}
            </p>
            {table.since && (
              <p
                className="text-[10px] font-600 mt-0.5"
                style={{ color: urg === "high" ? "#EF4444" : urg === "mid" ? "#F59E0B" : "#64748B" }}
              >
                {elapsed(table.since)}
              </p>
            )}
          </div>
        )}
      </div>

      {/* Bottom: covers + status label */}
      <div className="flex items-center justify-between">
        <span className="text-[10px] text-slate-600 font-500">
          {table.covers ? `${table.covers}/${table.seats} pax` : `${table.seats} asientos`}
        </span>
        <span
          className="text-[9px] font-700 px-1.5 py-0.5 rounded-md"
          style={{ backgroundColor: cfg.bg, color: cfg.color }}
        >
          {cfg.label}
        </span>
      </div>
    </button>
  );
}

// ── Table Detail Panel ────────────────────────────────────────────────────────
function DetailPanel({
  table,
  onClose,
  onAction,
  onStatusChange,
}: {
  table: Table;
  onClose: () => void;
  onAction: (id: string, tableId: number) => void;
  onStatusChange: (tableId: number, status: Status) => void;
}) {
  const cfg = STATUS_CFG[table.status];
  const total = totalAmount(table.items);
  const urg = urgency(table.since);

  return (
    <div className="flex flex-col h-full bg-slate-900 border-l border-slate-800">
      {/* Header */}
      <div
        className="flex items-center justify-between px-5 py-4 border-b border-slate-800"
        style={{ backgroundColor: `${cfg.color}10` }}
      >
        <div className="flex items-center gap-3">
          <div
            className="w-10 h-10 rounded-xl flex items-center justify-center text-lg font-800"
            style={{ backgroundColor: cfg.bg, border: `1.5px solid ${cfg.color}50`, color: cfg.color }}
          >
            {cfg.icon}
          </div>
          <div>
            <p className="text-base font-800 text-slate-100">{table.label}</p>
            <p className="text-xs font-500" style={{ color: cfg.color }}>{cfg.label} · Zona {table.zone}</p>
          </div>
        </div>
        <button
          onClick={onClose}
          className="w-8 h-8 rounded-xl bg-slate-800 flex items-center justify-center text-slate-400 hover:text-slate-200 text-lg leading-none"
        >
          ×
        </button>
      </div>

      {/* Scrollable body */}
      <div className="flex-1 overflow-y-auto px-5 py-4 space-y-5">

        {/* Meta row */}
        {table.since ? (
          <div className="grid grid-cols-3 gap-3">
            {[
              { label: "Tiempo",    value: elapsed(table.since), highlight: urg === "high" ? "#EF4444" : urg === "mid" ? "#F59E0B" : "#94A3B8" },
              { label: "Cubiertos", value: `${table.covers} pax`, highlight: "#94A3B8" },
              { label: "Total",     value: `€${total.toFixed(2)}`, highlight: cfg.color },
            ].map((s) => (
              <div key={s.label} className="p-3 rounded-xl bg-slate-800 text-center">
                <p className="text-xs text-slate-500 font-500 mb-1">{s.label}</p>
                <p className="text-sm font-800" style={{ color: s.highlight }}>{s.value}</p>
              </div>
            ))}
          </div>
        ) : (
          <div className="p-4 rounded-xl bg-slate-800/60 text-center">
            <p className="text-slate-500 text-sm">Mesa disponible · {table.seats} asientos</p>
          </div>
        )}

        {/* Waiter */}
        {table.waiter && (
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-full bg-amber-500/20 border border-amber-500/30 flex items-center justify-center text-xs font-700 text-amber-400">
              {table.waiter[0]}
            </div>
            <div>
              <p className="text-xs text-slate-500">Camarero asignado</p>
              <p className="text-sm font-600 text-slate-200">{table.waiter}</p>
            </div>
          </div>
        )}

        {/* Note */}
        {table.note && (
          <div className="flex items-start gap-2 p-3 rounded-xl bg-rose-500/10 border border-rose-500/20">
            <span className="text-rose-400 mt-0.5 flex-shrink-0">⚠</span>
            <p className="text-xs text-rose-300 font-500">{table.note}</p>
          </div>
        )}

        {/* Order items */}
        {table.items && table.items.length > 0 && (
          <div>
            <p className="text-xs font-700 text-slate-500 uppercase tracking-widest mb-3">Pedido Activo</p>
            <div className="space-y-2">
              {table.items.map((item, i) => (
                <div
                  key={i}
                  className="flex items-center justify-between px-3 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-750 transition-colors"
                >
                  <div className="flex items-center gap-2.5">
                    <span
                      className="w-6 h-6 rounded-lg flex items-center justify-center text-xs font-800 flex-shrink-0"
                      style={{ backgroundColor: cfg.bg, color: cfg.color }}
                    >
                      {item.qty}
                    </span>
                    <span className="text-sm text-slate-200 font-500">{item.name}</span>
                  </div>
                  <span className="text-sm font-700 text-slate-300 tabular-nums">
                    €{(item.qty * item.price).toFixed(2)}
                  </span>
                </div>
              ))}
            </div>

            {/* Total */}
            <div className="flex items-center justify-between mt-3 pt-3 border-t border-slate-800">
              <span className="text-xs text-slate-500 font-600">TOTAL</span>
              <span className="text-xl font-800" style={{ color: cfg.color }}>€{total.toFixed(2)}</span>
            </div>
          </div>
        )}

        {/* Status changer */}
        <div>
          <p className="text-xs font-700 text-slate-500 uppercase tracking-widest mb-2">Cambiar Estado</p>
          <div className="grid grid-cols-2 gap-2">
            {(Object.entries(STATUS_CFG) as [Status, typeof STATUS_CFG[Status]][]).map(([key, c]) => (
              <button
                key={key}
                onClick={() => onStatusChange(table.id, key)}
                className="flex items-center gap-2 px-3 py-2 rounded-xl border text-xs font-600 transition-all"
                style={
                  table.status === key
                    ? { backgroundColor: c.bg, borderColor: c.color, color: c.color }
                    : { backgroundColor: "transparent", borderColor: "#1E293B", color: "#64748B" }
                }
              >
                <span className="w-2 h-2 rounded-full" style={{ backgroundColor: c.color }} />
                {c.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="px-5 py-4 border-t border-slate-800 bg-slate-950 space-y-2">
        <p className="text-xs font-700 text-slate-600 uppercase tracking-widest mb-3">Acciones Rápidas</p>
        <div className="grid grid-cols-2 gap-2">
          {QUICK_ACTIONS.map((a) => (
            <button
              key={a.id}
              onClick={() => onAction(a.id, table.id)}
              className="flex items-center gap-2 px-3 py-2.5 rounded-xl border border-slate-800 bg-slate-800/60 hover:bg-slate-700 active:scale-[0.97] transition-all text-left"
            >
              <span className="text-base flex-shrink-0">{a.icon}</span>
              <span className="text-xs font-600 text-slate-300 leading-tight">{a.label}</span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

// ── Zone Badge ────────────────────────────────────────────────────────────────
function ZoneStats({ tables, zone }: { tables: Table[]; zone: Zone }) {
  const filtered = zone === "all" ? tables : tables.filter((t) => t.zone === zone);
  const counts = {
    free:     filtered.filter(t => t.status === "free").length,
    occupied: filtered.filter(t => t.status === "occupied").length,
    bill:     filtered.filter(t => t.status === "bill").length,
    dirty:    filtered.filter(t => t.status === "dirty").length,
  };
  return (
    <div className="flex items-center gap-3 flex-wrap">
      {(Object.entries(STATUS_CFG) as [Status, typeof STATUS_CFG[Status]][]).map(([key, c]) => (
        <div key={key} className="flex items-center gap-1.5">
          <span className="w-2 h-2 rounded-full" style={{ backgroundColor: c.color }} />
          <span className="text-xs text-slate-500 font-500 tabular-nums">{counts[key]} {c.label}</span>
        </div>
      ))}
    </div>
  );
}

// ── Main App ──────────────────────────────────────────────────────────────────
export default function App() {
  const [tables, setTables] = useState<Table[]>(INITIAL_TABLES);
  const [selectedId, setSelectedId] = useState<number | null>(null);
  const [zone, setZone] = useState<Zone>("all");
  const [toast, setToast] = useState<string | null>(null);
  const toastRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const selectedTable = tables.find(t => t.id === selectedId) ?? null;

  const ZONES: { key: Zone; label: string; icon: string }[] = [
    { key: "all",      label: "Todo el Local", icon: "⊞" },
    { key: "sala",     label: "Sala",           icon: "🪑" },
    { key: "terraza",  label: "Terraza",        icon: "☀" },
    { key: "barra",    label: "Barra",           icon: "🍺" },
  ];

  const visibleTables = zone === "all" ? tables : tables.filter(t => t.zone === zone);

  // Group by zone for sectioned layout
  const salaTables    = visibleTables.filter(t => t.zone === "sala");
  const terrazaTables = visibleTables.filter(t => t.zone === "terraza");
  const barraTables   = visibleTables.filter(t => t.zone === "barra");

  function showToast(msg: string) {
    setToast(msg);
    if (toastRef.current) clearTimeout(toastRef.current);
    toastRef.current = setTimeout(() => setToast(null), 2800);
  }

  function handleAction(actionId: string, tableId: number) {
    const t = tables.find(t => t.id === tableId);
    if (!t) return;
    const msgs: Record<string, string> = {
      order:   `📋 Abriendo pedido para ${t.label}…`,
      add:     `➕ Agregar productos a ${t.label}`,
      bill:    `🧾 Imprimiendo pre-cuenta de ${t.label}…`,
      move:    `↔ Selecciona la mesa de destino`,
      clean:   `🧹 Limpieza solicitada para ${t.label}`,
      reserve: `🔒 ${t.label} marcada como reservada`,
    };
    if (actionId === "clean") {
      setTables(prev => prev.map(p => p.id === tableId ? { ...p, status: "dirty" } : p));
    }
    if (actionId === "bill") {
      setTables(prev => prev.map(p => p.id === tableId && p.status === "occupied" ? { ...p, status: "bill" } : p));
    }
    showToast(msgs[actionId] ?? "Acción ejecutada");
  }

  function handleStatusChange(tableId: number, status: Status) {
    setTables(prev => prev.map(t => {
      if (t.id !== tableId) return t;
      const next: Table = { ...t, status };
      if (status === "free") { next.items = undefined; next.since = undefined; next.waiter = undefined; next.covers = undefined; next.note = undefined; }
      return next;
    }));
    const cfg = STATUS_CFG[status];
    showToast(`Mesa actualizada → ${cfg.label}`);
  }

  // Summary counts
  const totalOccupied = tables.filter(t => t.status === "occupied").length;
  const totalBill     = tables.filter(t => t.status === "bill").length;
  const totalFree     = tables.filter(t => t.status === "free").length;
  const totalDirty    = tables.filter(t => t.status === "dirty").length;
  const totalRevenue  = tables.reduce((s, t) => s + totalAmount(t.items), 0);

  return (
    <div
      className="flex flex-col h-full bg-slate-950 text-slate-100 overflow-hidden"
      style={{ fontFamily: "'Inter', 'Plus Jakarta Sans', system-ui, sans-serif" }}
    >
      {/* ── Top Bar ──────────────────────────────────────────────────────── */}
      <header className="flex items-center justify-between px-4 h-14 border-b border-slate-800 flex-shrink-0 bg-slate-950 gap-3">
        {/* Brand */}
        <div className="flex items-center gap-3 flex-shrink-0">
          <div
            className="w-9 h-9 rounded-xl flex items-center justify-center text-lg text-slate-900 font-900 flex-shrink-0"
            style={{ background: "linear-gradient(135deg, #F59E0B, #FBBF24)", boxShadow: "0 0 16px rgba(245,158,11,0.4)" }}
          >
            🔥
          </div>
          <div className="hidden sm:block">
            <p className="text-sm font-800 text-slate-200 leading-tight">Ember & Rye</p>
            <p className="text-[10px] text-slate-600 font-500">Turno Noche · Carlos M.</p>
          </div>
        </div>

        {/* KPI strip */}
        <div className="flex items-center gap-2 flex-1 justify-center overflow-x-auto">
          {[
            { label: "Libres",       val: totalFree,     color: "#22C55E" },
            { label: "Ocupadas",     val: totalOccupied, color: "#F59E0B" },
            { label: "Pre-cuenta",   val: totalBill,     color: "#3B82F6" },
            { label: "Limpieza",     val: totalDirty,    color: "#EF4444" },
          ].map((k) => (
            <div
              key={k.label}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl flex-shrink-0"
              style={{ backgroundColor: `${k.color}12`, border: `1px solid ${k.color}25` }}
            >
              <span className="text-sm font-800 tabular-nums" style={{ color: k.color }}>{k.val}</span>
              <span className="text-[10px] font-500 text-slate-500 hidden sm:inline">{k.label}</span>
            </div>
          ))}
          <div className="hidden md:flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-amber-500/10 border border-amber-500/20 flex-shrink-0">
            <span className="text-sm font-800 tabular-nums text-amber-400">€{totalRevenue.toFixed(0)}</span>
            <span className="text-[10px] font-500 text-slate-500">Activo</span>
          </div>
        </div>

        {/* Clock */}
        <div className="flex items-center gap-3 flex-shrink-0">
          <Clock />
          <div className="flex items-center gap-1.5 px-2 py-1 rounded-lg bg-emerald-500/10 border border-emerald-500/20">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
            <span className="text-[10px] font-600 text-emerald-400 hidden sm:inline">Online</span>
          </div>
        </div>
      </header>

      {/* ── Zone Filters ─────────────────────────────────────────────────── */}
      <div className="flex items-center gap-2 px-4 py-2.5 border-b border-slate-800 bg-slate-950 flex-shrink-0 overflow-x-auto">
        {ZONES.map((z) => (
          <button
            key={z.key}
            onClick={() => setZone(z.key)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-700 transition-all duration-150 flex-shrink-0 whitespace-nowrap"
            style={
              zone === z.key
                ? { backgroundColor: "#F59E0B", color: "#0F172A", boxShadow: "0 2px 10px rgba(245,158,11,0.4)" }
                : { backgroundColor: "rgba(30,41,59,0.6)", color: "#64748B", border: "1px solid #1E293B" }
            }
          >
            <span>{z.icon}</span>
            <span>{z.label}</span>
            <span
              className="w-4 h-4 rounded-full text-[9px] font-800 flex items-center justify-center"
              style={{ backgroundColor: zone === z.key ? "rgba(0,0,0,0.2)" : "#1E293B", color: zone === z.key ? "#0F172A" : "#475569" }}
            >
              {(z.key === "all" ? tables : tables.filter(t => t.zone === z.key)).length}
            </span>
          </button>
        ))}

        <div className="flex-1" />
        <ZoneStats tables={tables} zone={zone} />
      </div>

      {/* ── Main split ───────────────────────────────────────────────────── */}
      <div className="flex flex-1 overflow-hidden">

        {/* Floor plan */}
        <div className={`flex-1 overflow-y-auto p-4 transition-all duration-300 ${selectedTable ? "hidden lg:block" : ""}`}>
          <div className="space-y-6">

            {/* Sala */}
            {salaTables.length > 0 && (
              <section>
                <div className="flex items-center gap-2 mb-3">
                  <span className="text-[10px] font-800 text-slate-600 uppercase tracking-widest">🪑 Sala Principal</span>
                  <span className="flex-1 h-px bg-slate-800" />
                  <span className="text-[10px] text-slate-600">{salaTables.filter(t => t.status === "occupied" || t.status === "bill").length}/{salaTables.length}</span>
                </div>
                <div className="grid grid-cols-4 sm:grid-cols-5 md:grid-cols-6 gap-2.5">
                  {salaTables.map((t) => (
                    <TableCard
                      key={t.id}
                      table={t}
                      selected={selectedId === t.id}
                      onClick={() => setSelectedId(selectedId === t.id ? null : t.id)}
                    />
                  ))}
                </div>
              </section>
            )}

            {/* Terraza */}
            {terrazaTables.length > 0 && (
              <section>
                <div className="flex items-center gap-2 mb-3">
                  <span className="text-[10px] font-800 text-slate-600 uppercase tracking-widest">☀ Terraza</span>
                  <span className="flex-1 h-px bg-slate-800" />
                  <span className="text-[10px] text-slate-600">{terrazaTables.filter(t => t.status === "occupied" || t.status === "bill").length}/{terrazaTables.length}</span>
                </div>
                <div className="grid grid-cols-4 sm:grid-cols-5 md:grid-cols-6 gap-2.5">
                  {terrazaTables.map((t) => (
                    <TableCard
                      key={t.id}
                      table={t}
                      selected={selectedId === t.id}
                      onClick={() => setSelectedId(selectedId === t.id ? null : t.id)}
                    />
                  ))}
                </div>
              </section>
            )}

            {/* Barra */}
            {barraTables.length > 0 && (
              <section>
                <div className="flex items-center gap-2 mb-3">
                  <span className="text-[10px] font-800 text-slate-600 uppercase tracking-widest">🍺 Barra</span>
                  <span className="flex-1 h-px bg-slate-800" />
                  <span className="text-[10px] text-slate-600">{barraTables.filter(t => t.status === "occupied" || t.status === "bill").length}/{barraTables.length}</span>
                </div>
                <div className="flex flex-wrap gap-2.5">
                  {barraTables.map((t) => (
                    <div key={t.id} style={{ width: 100 }}>
                      <TableCard
                        table={t}
                        selected={selectedId === t.id}
                        onClick={() => setSelectedId(selectedId === t.id ? null : t.id)}
                      />
                    </div>
                  ))}
                </div>
              </section>
            )}
          </div>
        </div>

        {/* Detail panel — desktop sidebar, mobile fullscreen */}
        {selectedTable && (
          <div className="w-full lg:w-80 xl:w-96 flex-shrink-0 overflow-hidden">
            <DetailPanel
              table={selectedTable}
              onClose={() => setSelectedId(null)}
              onAction={handleAction}
              onStatusChange={handleStatusChange}
            />
          </div>
        )}
      </div>

      {/* ── Toast ────────────────────────────────────────────────────────── */}
      {toast && (
        <div
          className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 px-5 py-3 rounded-2xl text-sm font-600 text-slate-100 bg-slate-800 border border-slate-700 pointer-events-none"
          style={{ boxShadow: "0 8px 32px rgba(0,0,0,0.6)", animation: "fadeInUp 0.2s ease" }}
        >
          {toast}
        </div>
      )}

      <style>{`
        @keyframes fadeInUp {
          from { opacity: 0; transform: translate(-50%, 8px); }
          to   { opacity: 1; transform: translate(-50%, 0); }
        }
        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.4; }
        }
      `}</style>
    </div>
  );
}
