import { useState, useRef, useEffect } from "react";

// ── Types ──────────────────────────────────────────────────────────────────────
interface MenuItem {
  id: number;
  name: string;
  description: string;
  price: number;
  originalPrice?: number;
  image: string;
  category: string;
  badge?: "2x1" | "POPULAR" | string;
  badgeColor?: string;
}

interface CartItem extends MenuItem {
  qty: number;
}

// ── Data ───────────────────────────────────────────────────────────────────────
const MENU: MenuItem[] = [
  // Promos
  {
    id: 1,
    name: "Smash Burger Clásico",
    description: "Double smash patty, cheddar fundido, bacon crocante, pepinillos, salsa especial de la casa.",
    price: 12.9,
    originalPrice: 16.1,
    image: "https://images.unsplash.com/photo-1550547660-d9450f859349?w=400&h=300&fit=crop&auto=format",
    category: "Promos",
    badge: "-20%",
    badgeColor: "bg-rose-500",
  },
  {
    id: 2,
    name: "Margarita Passion",
    description: "Tequila blanco, maracuyá fresco, limón, sal de gusano. Happy hour 2x1.",
    price: 9.5,
    image: "https://images.unsplash.com/photo-1597075687490-8f673c6c17f6?w=400&h=300&fit=crop&auto=format",
    category: "Promos",
    badge: "2x1",
    badgeColor: "bg-amber-500",
  },
  // Burgers
  {
    id: 3,
    name: "Smash BBQ Doble",
    description: "Dos patties de res, queso americano, cebolla caramelizada, jalapeños y salsa BBQ ahumada.",
    price: 14.9,
    originalPrice: 17.5,
    image: "https://images.unsplash.com/photo-1667329829058-ac191ba4a905?w=400&h=300&fit=crop&auto=format",
    category: "Burgers",
    badge: "POPULAR",
    badgeColor: "bg-emerald-500",
  },
  {
    id: 4,
    name: "Crispy Chicken Burger",
    description: "Pollo crujiente, coleslaw de mango, sriracha mayo, brioche tostado.",
    price: 13.5,
    image: "https://images.unsplash.com/photo-1610970878459-a0e464d7592b?w=400&h=300&fit=crop&auto=format",
    category: "Burgers",
  },
  {
    id: 5,
    name: "Veggie Smash",
    description: "Patty de portobello y lentejas, aguacate, tomate confitado, queso feta, pesto de albahaca.",
    price: 12.0,
    image: "https://images.unsplash.com/photo-1552604617-eea98aa27234?w=400&h=300&fit=crop&auto=format",
    category: "Burgers",
  },
  // Cocktails
  {
    id: 6,
    name: "Negroni Fumado",
    description: "Gin ahumado, Campari, vermut rosso, twist de naranja. Servido con esfera de hielo.",
    price: 10.5,
    image: "https://images.unsplash.com/photo-1623408859815-22534357b3db?w=400&h=300&fit=crop&auto=format",
    category: "Cocktails",
    badge: "POPULAR",
    badgeColor: "bg-emerald-500",
  },
  {
    id: 7,
    name: "Espresso Martini",
    description: "Vodka premium, licor de café, espresso doble, espuma de vainilla.",
    price: 11.0,
    image: "https://images.unsplash.com/photo-1615887026505-00283cf0ff83?w=400&h=300&fit=crop&auto=format",
    category: "Cocktails",
    badge: "2x1",
    badgeColor: "bg-amber-500",
  },
  {
    id: 8,
    name: "Rum Old Fashioned",
    description: "Ron añejo 12 años, bitters de naranja, azúcar morena, cáscara de naranja flambeada.",
    price: 12.0,
    image: "https://images.unsplash.com/photo-1598994671512-395d7a6147e0?w=400&h=300&fit=crop&auto=format",
    category: "Cocktails",
  },
  // Pizzas
  {
    id: 9,
    name: "Burrata & Trufa",
    description: "Base de crema trufada, burrata fresca, rúcula, parmesano, aceite de trufa negra.",
    price: 16.9,
    image: "https://images.unsplash.com/photo-1555072956-7758afb20e8f?w=400&h=300&fit=crop&auto=format",
    category: "Pizzas",
    badge: "POPULAR",
    badgeColor: "bg-emerald-500",
  },
  {
    id: 10,
    name: "Diavola Picante",
    description: "Salsa de tomate San Marzano, mozzarella fior di latte, salame picante, pepperoncini.",
    price: 14.5,
    image: "https://images.unsplash.com/photo-1682264788192-9abdec90c425?w=400&h=300&fit=crop&auto=format",
    category: "Pizzas",
  },
  // Desserts
  {
    id: 11,
    name: "Volcán de Chocolate",
    description: "Coulant tibio de cacao 70%, helado de vainilla bourbon, caramelo salado, tierra de cacao.",
    price: 8.5,
    image: "https://images.unsplash.com/photo-1700448293876-07dca826c161?w=400&h=300&fit=crop&auto=format",
    category: "Desserts",
    badge: "POPULAR",
    badgeColor: "bg-emerald-500",
  },
  {
    id: 12,
    name: "Tiramisú de la Casa",
    description: "Mascarpone artesanal, café cold brew, savoiardi, cacao belga en polvo.",
    price: 7.9,
    image: "https://images.unsplash.com/photo-1615796701805-2094ac54bbf9?w=400&h=300&fit=crop&auto=format",
    category: "Desserts",
  },
];

const CATEGORIES = ["Todos", "Promos", "Burgers", "Cocktails", "Pizzas", "Desserts"];

const PROMOS = [
  { id: 1, label: "🍹 2x1 Cocktails hasta las 9 PM", sub: "Happy Hour · Todos los días" },
  { id: 2, label: "🍔 -20% Smash Burgers", sub: "Solo hoy · Código: SMASH20" },
  { id: 3, label: "🍕 Pizza + Postre €18", sub: "Combo especial · Cena" },
  { id: 4, label: "🥂 Bottle service desde €60", sub: "Reserva en mesa · VIP" },
];

// ── Sub-components ─────────────────────────────────────────────────────────────
function Badge({ text, color }: { text: string; color?: string }) {
  return (
    <span
      className={`inline-flex items-center px-2 py-0.5 rounded-md text-[10px] font-800 tracking-wide text-white ${color ?? "bg-amber-500"}`}
    >
      {text}
    </span>
  );
}

function PromoCarousel({ dark }: { dark: boolean }) {
  const [idx, setIdx] = useState(0);

  useEffect(() => {
    const t = setInterval(() => setIdx((i) => (i + 1) % PROMOS.length), 3500);
    return () => clearInterval(t);
  }, []);

  return (
    <div
      className={`relative overflow-hidden ${dark ? "bg-amber-500/10 border-amber-500/20" : "bg-amber-50 border-amber-200"} border-b`}
      style={{ minHeight: 52 }}
    >
      <div className="flex items-center gap-3 px-4 py-3">
        <div
          className="flex-shrink-0 w-1.5 h-8 rounded-full bg-amber-500"
          style={{ boxShadow: "0 0 8px #F59E0B" }}
        />
        <div className="flex-1 overflow-hidden">
          {PROMOS.map((p, i) => (
            <div
              key={p.id}
              className="transition-all duration-500 ease-in-out"
              style={{
                display: i === idx ? "block" : "none",
              }}
            >
              <p className={`text-sm font-700 leading-tight ${dark ? "text-amber-300" : "text-amber-700"}`}>
                {p.label}
              </p>
              <p className={`text-xs mt-0.5 ${dark ? "text-slate-400" : "text-slate-500"}`}>{p.sub}</p>
            </div>
          ))}
        </div>
        <div className="flex gap-1 flex-shrink-0">
          {PROMOS.map((_, i) => (
            <button
              key={i}
              onClick={() => setIdx(i)}
              className={`rounded-full transition-all duration-300 ${
                i === idx ? "w-4 h-1.5 bg-amber-500" : "w-1.5 h-1.5 bg-slate-400/40"
              }`}
            />
          ))}
        </div>
      </div>
    </div>
  );
}

function MenuCard({
  item,
  dark,
  onAdd,
}: {
  item: MenuItem;
  dark: boolean;
  onAdd: (item: MenuItem) => void;
}) {
  const [added, setAdded] = useState(false);

  function handleAdd() {
    onAdd(item);
    setAdded(true);
    setTimeout(() => setAdded(false), 900);
  }

  return (
    <div
      className={`flex gap-3 p-3 rounded-2xl transition-all duration-200 active:scale-[0.98] ${
        dark
          ? "bg-slate-800 shadow-[0_2px_12px_rgba(0,0,0,0.4)]"
          : "bg-white shadow-[0_2px_12px_rgba(0,0,0,0.08)]"
      }`}
    >
      {/* Image */}
      <div className="relative flex-shrink-0 w-24 h-24 rounded-xl overflow-hidden bg-slate-700">
        <img
          src={item.image}
          alt={item.name}
          className="w-full h-full object-cover"
          loading="lazy"
        />
        {item.badge && (
          <div className="absolute top-1.5 left-1.5">
            <Badge text={item.badge} color={item.badgeColor} />
          </div>
        )}
      </div>

      {/* Content */}
      <div className="flex-1 flex flex-col justify-between min-w-0">
        <div>
          <h3 className={`text-sm font-700 leading-tight truncate ${dark ? "text-slate-100" : "text-slate-900"}`}>
            {item.name}
          </h3>
          <p className={`text-xs mt-1 leading-relaxed line-clamp-2 ${dark ? "text-slate-400" : "text-slate-500"}`}>
            {item.description}
          </p>
        </div>

        <div className="flex items-center justify-between mt-2">
          <div className="flex items-baseline gap-1.5">
            <span className="text-amber-500 font-800 text-base">€{item.price.toFixed(2)}</span>
            {item.originalPrice && (
              <span className={`text-xs line-through ${dark ? "text-slate-500" : "text-slate-400"}`}>
                €{item.originalPrice.toFixed(2)}
              </span>
            )}
          </div>
          <button
            onClick={handleAdd}
            className={`w-8 h-8 rounded-full flex items-center justify-center text-lg font-600 transition-all duration-200 ${
              added
                ? "bg-emerald-500 text-white scale-90"
                : "bg-amber-500 text-slate-900 active:scale-90 hover:bg-amber-400"
            }`}
            style={{ boxShadow: added ? "0 0 12px rgba(16,185,129,0.5)" : "0 2px 8px rgba(245,158,11,0.4)" }}
            aria-label={`Agregar ${item.name}`}
          >
            {added ? "✓" : "+"}
          </button>
        </div>
      </div>
    </div>
  );
}

function CartDrawer({
  cart,
  dark,
  open,
  onToggle,
  onClear,
}: {
  cart: CartItem[];
  dark: boolean;
  open: boolean;
  onToggle: () => void;
  onClear: () => void;
}) {
  const total = cart.reduce((s, i) => s + i.price * i.qty, 0);
  const count = cart.reduce((s, i) => s + i.qty, 0);

  if (count === 0) return null;

  return (
    <>
      {/* Backdrop */}
      {open && (
        <div
          className="fixed inset-0 z-30 bg-black/60 backdrop-blur-sm"
          onClick={onToggle}
        />
      )}

      {/* Drawer */}
      <div
        className={`fixed bottom-0 left-0 right-0 z-40 transition-transform duration-350 ease-out ${
          open ? "translate-y-0" : "translate-y-[calc(100%-72px)]"
        }`}
        style={{ maxWidth: 480, margin: "0 auto" }}
      >
        {/* Handle / Collapsed Bar */}
        <button
          onClick={onToggle}
          className={`w-full flex items-center justify-between px-5 py-4 rounded-t-3xl ${
            dark ? "bg-slate-800 border-t border-slate-700" : "bg-white border-t border-slate-200"
          }`}
          style={{ boxShadow: "0 -4px 24px rgba(0,0,0,0.25)" }}
        >
          <div className="flex items-center gap-3">
            <div
              className="relative flex items-center justify-center w-10 h-10 rounded-full bg-amber-500"
              style={{ boxShadow: "0 0 16px rgba(245,158,11,0.5)" }}
            >
              <span className="text-xl">🛒</span>
              <span className="absolute -top-1 -right-1 min-w-5 h-5 px-1 rounded-full bg-rose-500 text-white text-[10px] font-800 flex items-center justify-center">
                {count}
              </span>
            </div>
            <div className="text-left">
              <p className={`text-xs ${dark ? "text-slate-400" : "text-slate-500"}`}>
                {count} {count === 1 ? "producto" : "productos"}
              </p>
              <p className={`text-base font-800 ${dark ? "text-slate-100" : "text-slate-900"}`}>
                €{total.toFixed(2)}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <span
              className={`text-sm font-700 px-4 py-2 rounded-xl bg-amber-500 text-slate-900`}
              style={{ boxShadow: "0 2px 8px rgba(245,158,11,0.4)" }}
            >
              Ver Pedido
            </span>
            <span className={`text-xs ${dark ? "text-slate-500" : "text-slate-400"} transition-transform duration-300 ${open ? "rotate-180" : ""}`}>
              ▲
            </span>
          </div>
        </button>

        {/* Expanded panel */}
        {open && (
          <div
            className={`${dark ? "bg-slate-800" : "bg-white"} px-4 pb-6 max-h-[60vh] overflow-y-scroll`}
          >
            <div className="space-y-3 pt-2">
              {cart.map((item) => (
                <div key={item.id} className="flex items-center gap-3">
                  <img
                    src={item.image}
                    alt={item.name}
                    className="w-12 h-12 rounded-xl object-cover bg-slate-700 flex-shrink-0"
                  />
                  <div className="flex-1 min-w-0">
                    <p className={`text-sm font-600 truncate ${dark ? "text-slate-100" : "text-slate-900"}`}>
                      {item.name}
                    </p>
                    <p className={`text-xs ${dark ? "text-slate-400" : "text-slate-500"}`}>
                      {item.qty} × €{item.price.toFixed(2)}
                    </p>
                  </div>
                  <p className="text-amber-500 font-700 text-sm flex-shrink-0">
                    €{(item.qty * item.price).toFixed(2)}
                  </p>
                </div>
              ))}
            </div>

            <div className={`mt-4 pt-4 border-t ${dark ? "border-slate-700" : "border-slate-100"} flex justify-between items-center`}>
              <span className={`text-sm font-600 ${dark ? "text-slate-300" : "text-slate-600"}`}>Total</span>
              <span className="text-amber-500 font-800 text-lg">€{total.toFixed(2)}</span>
            </div>

            <button
              onClick={() => { alert("¡Pedido enviado! Un momento por favor 🍽️"); onClear(); onToggle(); }}
              className="mt-4 w-full py-4 rounded-2xl bg-amber-500 text-slate-900 font-800 text-base transition-all active:scale-[0.98] hover:bg-amber-400"
              style={{ boxShadow: "0 4px 20px rgba(245,158,11,0.5)" }}
            >
              Confirmar Pedido · €{total.toFixed(2)}
            </button>

            <button
              onClick={onClear}
              className={`mt-2 w-full py-2.5 rounded-xl text-sm font-600 ${dark ? "text-slate-500 hover:text-slate-300" : "text-slate-400 hover:text-slate-600"} transition-colors`}
            >
              Vaciar carrito
            </button>
          </div>
        )}
      </div>
    </>
  );
}

// ── Main App ───────────────────────────────────────────────────────────────────
export default function App() {
  const [dark, setDark] = useState(true);
  const [activeCategory, setActiveCategory] = useState("Todos");
  const [cart, setCart] = useState<CartItem[]>([]);
  const [cartOpen, setCartOpen] = useState(false);
  const pillsRef = useRef<HTMLDivElement>(null);

  const filtered =
    activeCategory === "Todos" ? MENU : MENU.filter((m) => m.category === activeCategory);

  function addToCart(item: MenuItem) {
    setCart((prev) => {
      const existing = prev.find((c) => c.id === item.id);
      if (existing) return prev.map((c) => c.id === item.id ? { ...c, qty: c.qty + 1 } : c);
      return [...prev, { ...item, qty: 1 }];
    });
  }

  function clearCart() {
    setCart([]);
  }

  const cartCount = cart.reduce((s, i) => s + i.qty, 0);

  const bg = dark ? "bg-slate-900" : "bg-slate-100";
  const text = dark ? "text-slate-100" : "text-slate-900";
  const subtext = dark ? "text-slate-400" : "text-slate-500";

  return (
    <div className={`min-h-full ${bg} ${text} transition-colors duration-300`} style={{ fontFamily: "'Plus Jakarta Sans', system-ui, sans-serif", maxWidth: 480, margin: "0 auto", position: "relative" }}>

      {/* ── Hero Header ─────────────────────────────────────────────────── */}
      <div className="relative h-56 overflow-hidden">
        <img
          src="https://images.unsplash.com/photo-1770816307454-892c27fc625e?w=800&h=500&fit=crop&auto=format"
          alt="Interior del restaurante"
          className="w-full h-full object-cover"
        />
        {/* Gradient overlay */}
        <div
          className="absolute inset-0"
          style={{
            background: dark
              ? "linear-gradient(to bottom, rgba(15,23,42,0.3) 0%, rgba(15,23,42,0.85) 100%)"
              : "linear-gradient(to bottom, rgba(0,0,0,0.1) 0%, rgba(0,0,0,0.65) 100%)",
          }}
        />

        {/* Theme toggle */}
        <button
          onClick={() => setDark(!dark)}
          className="absolute top-4 right-4 w-9 h-9 rounded-full bg-black/30 backdrop-blur-sm flex items-center justify-center text-base"
          aria-label="Cambiar tema"
        >
          {dark ? "☀️" : "🌙"}
        </button>

        {/* Branding */}
        <div className="absolute bottom-0 left-0 right-0 px-4 pb-4">
          <div className="flex items-end gap-3">
            {/* Logo placeholder */}
            <div
              className="w-14 h-14 rounded-2xl bg-amber-500 flex items-center justify-center text-2xl flex-shrink-0 border-2 border-white/20"
              style={{ boxShadow: "0 4px 16px rgba(0,0,0,0.4)" }}
            >
              🔥
            </div>
            <div className="flex-1 min-w-0">
              <h1 className="text-white font-800 text-xl leading-tight">Ember & Rye</h1>
              <p className="text-white/70 text-xs mt-0.5">Resto-Bar · Mesa 12</p>
              <div className="flex items-center gap-2 mt-1.5">
                <span className="flex items-center gap-1 text-[10px] font-600 px-2 py-0.5 rounded-full bg-emerald-500/90 text-white">
                  <span className="w-1.5 h-1.5 rounded-full bg-white animate-pulse" />
                  Abierto hasta las 2 AM
                </span>
                <span className="flex items-center gap-1 text-[10px] font-600 px-2 py-0.5 rounded-full bg-black/40 text-white backdrop-blur-sm">
                  📶 Ember_Guest · 1234
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ── Promo Carousel ──────────────────────────────────────────────── */}
      <PromoCarousel dark={dark} />

      {/* ── Category Pills ──────────────────────────────────────────────── */}
      <div
        ref={pillsRef}
        className="flex gap-2 px-4 py-3 overflow-x-auto"
        style={{ scrollSnapType: "x mandatory" }}
      >
        {CATEGORIES.map((cat) => {
          const active = activeCategory === cat;
          return (
            <button
              key={cat}
              onClick={() => setActiveCategory(cat)}
              className={`flex-shrink-0 px-4 py-2 rounded-full text-sm font-600 transition-all duration-200 ${
                active
                  ? "bg-amber-500 text-slate-900 shadow-[0_2px_12px_rgba(245,158,11,0.45)]"
                  : dark
                  ? "bg-slate-800 text-slate-400 hover:text-slate-200"
                  : "bg-white text-slate-500 shadow-sm hover:text-slate-700"
              }`}
            >
              {cat}
            </button>
          );
        })}
      </div>

      {/* ── Section Label ───────────────────────────────────────────────── */}
      <div className="px-4 pb-2 flex items-center justify-between">
        <div>
          <h2 className={`text-base font-800 ${text}`}>
            {activeCategory === "Todos" ? "Todo el menú" : activeCategory}
          </h2>
          <p className={`text-xs ${subtext}`}>{filtered.length} items disponibles</p>
        </div>
        {activeCategory !== "Todos" && (
          <button
            onClick={() => setActiveCategory("Todos")}
            className={`text-xs font-600 ${dark ? "text-amber-400" : "text-amber-600"}`}
          >
            Ver todo
          </button>
        )}
      </div>

      {/* ── Menu Items ──────────────────────────────────────────────────── */}
      <div className="px-4 pb-36 space-y-3">
        {filtered.map((item) => (
          <MenuCard key={item.id} item={item} dark={dark} onAdd={addToCart} />
        ))}
      </div>

      {/* ── Cart Drawer ─────────────────────────────────────────────────── */}
      <CartDrawer
        cart={cart}
        dark={dark}
        open={cartOpen}
        onToggle={() => setCartOpen(!cartOpen)}
        onClear={clearCart}
      />

      {/* Collapsed cart nudge when items added and cart closed */}
      {cartCount > 0 && !cartOpen && (
        <div
          className="fixed bottom-0 left-0 right-0 z-40 pointer-events-none"
          style={{ maxWidth: 480, margin: "0 auto" }}
        >
          <div className="h-[72px]" />
        </div>
      )}
    </div>
  );
}
