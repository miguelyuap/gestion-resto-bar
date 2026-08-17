-- ==============================================================================
-- ESQUEMA INICIAL DE BASE DE DATOS PARA "GRANIZADOS & FLOW" (SUPABASE / POSTGRESQL)
-- ==============================================================================

-- 1. EXTENSIONES
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 2. TABLA DE PRODUCTOS
CREATE TABLE IF NOT EXISTS public.productos (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    nombre TEXT NOT NULL,
    categoria TEXT NOT NULL CHECK (categoria IN ('con_licor', 'sin_licor', 'cremoso')),
    ingredientes TEXT,
    precio_8oz NUMERIC(10, 2) NOT NULL,
    precio_12oz NUMERIC(10, 2) NOT NULL,
    precio_24oz NUMERIC(10, 2) NOT NULL,
    precio_100oz NUMERIC(10, 2) NOT NULL,
    activo BOOLEAN NOT NULL DEFAULT true,
    imagen_url TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. TABLA DE MESAS
CREATE TABLE IF NOT EXISTS public.mesas (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    numero_mesa INTEGER UNIQUE NOT NULL,
    qr_code_url TEXT,
    estado TEXT NOT NULL DEFAULT 'disponible' CHECK (estado IN ('disponible', 'ocupada')),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. TABLA DE PEDIDOS
CREATE TABLE IF NOT EXISTS public.pedidos (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    mesa_id UUID REFERENCES public.mesas(id) ON DELETE RESTRICT,
    estado TEXT NOT NULL DEFAULT 'pendiente' CHECK (estado IN ('pendiente', 'en_preparacion', 'entregado', 'facturado')),
    total NUMERIC(10, 2) NOT NULL DEFAULT 0 CHECK (total >= 0),
    metodo_pago TEXT CHECK (metodo_pago IN ('efectivo', 'nequi', 'daviplata', 'tarjeta')),
    notas TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 5. TABLA DETALLE DE PEDIDOS (CON TAMAÑO DE GRANIZADO)
CREATE TABLE IF NOT EXISTS public.detalle_pedido (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    pedido_id UUID NOT NULL REFERENCES public.pedidos(id) ON DELETE CASCADE,
    producto_id UUID NOT NULL REFERENCES public.productos(id) ON DELETE RESTRICT,
    tamano TEXT NOT NULL CHECK (tamano IN ('8oz', '12oz', '24oz', '100oz')),
    cantidad INTEGER NOT NULL CHECK (cantidad > 0),
    precio_unitario NUMERIC(10, 2) NOT NULL CHECK (precio_unitario >= 0),
    subtotal NUMERIC(10, 2) GENERATED ALWAYS AS (cantidad * precio_unitario) STORED
);

-- 6. INDICES DE RENDIMIENTO
CREATE INDEX IF NOT EXISTS idx_pedidos_mesa_id ON public.pedidos(mesa_id);
CREATE INDEX IF NOT EXISTS idx_pedidos_estado ON public.pedidos(estado);
CREATE INDEX IF NOT EXISTS idx_pedidos_created_at ON public.pedidos(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_detalle_pedido_pedido_id ON public.detalle_pedido(pedido_id);
CREATE INDEX IF NOT EXISTS idx_productos_categoria ON public.productos(categoria);

-- 7. CONFIGURACION DE REALTIME EN SUPABASE
ALTER PUBLICATION supabase_realtime ADD TABLE public.pedidos;

-- 8. POLÍTICAS RLS
ALTER TABLE public.productos ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.mesas ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.pedidos ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.detalle_pedido ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Permitir lectura publica de productos" ON public.productos FOR SELECT USING (true);
CREATE POLICY "Permitir lectura publica de mesas" ON public.mesas FOR SELECT USING (true);
CREATE POLICY "Permitir lectura publica de pedidos" ON public.pedidos FOR SELECT USING (true);
CREATE POLICY "Permitir insercion publica de pedidos" ON public.pedidos FOR INSERT WITH CHECK (true);
CREATE POLICY "Permitir actualizacion publica de pedidos" ON public.pedidos FOR UPDATE USING (true);
CREATE POLICY "Permitir lectura publica de detalle_pedido" ON public.detalle_pedido FOR SELECT USING (true);
CREATE POLICY "Permitir insercion publica de detalle_pedido" ON public.detalle_pedido FOR INSERT WITH CHECK (true);

-- ==============================================================================
-- DATOS SEMILLA EXACTOS DEL MENÚ "GRANIZADOS & FLOW"
-- ==============================================================================

-- Mesas 1 a 10
INSERT INTO public.mesas (numero_mesa, estado) VALUES
(1, 'disponible'), (2, 'disponible'), (3, 'disponible'), (4, 'disponible'), (5, 'disponible'),
(6, 'disponible'), (7, 'disponible'), (8, 'disponible'), (9, 'disponible'), (10, 'disponible')
ON CONFLICT (numero_mesa) DO NOTHING;

-- PRODUCTOS CON LICOR (8oz: $12k, 12oz: $16k, 24oz: $24k, 100oz Nevera: $70k)
INSERT INTO public.productos (nombre, categoria, ingredientes, precio_8oz, precio_12oz, precio_24oz, precio_100oz, imagen_url) VALUES
('BLUE AGOGO', 'con_licor', 'Tequila - Citrile - Mora', 12000, 16000, 24000, 70000, 'https://images.unsplash.com/photo-1536935338788-846bb9981813?auto=format&fit=crop&w=400&q=80'),
('FOUR LOKO GOLD', 'con_licor', 'Naranja - Four Loko', 12000, 16000, 24000, 70000, 'https://images.unsplash.com/photo-1551024709-8f23befc6f87?auto=format&fit=crop&w=400&q=80'),
('SMIRNOFF LULO', 'con_licor', 'Vodka - Lulo', 12000, 16000, 24000, 70000, 'https://images.unsplash.com/photo-1513558161293-cdaf765ed2fd?auto=format&fit=crop&w=400&q=80'),
('TUSSI', 'con_licor', 'Vodka - Kola - Champagne', 12000, 16000, 24000, 70000, 'https://images.unsplash.com/photo-1572490122747-3968b75cc699?auto=format&fit=crop&w=400&q=80'),
('JAGER', 'con_licor', 'Jagermeister - Red Bull', 12000, 16000, 24000, 70000, 'https://images.unsplash.com/photo-1514362545857-3bc16c4c7d1b?auto=format&fit=crop&w=400&q=80'),
('MARGARITA', 'con_licor', 'Limón - Hipnotiq', 12000, 16000, 24000, 70000, 'https://images.unsplash.com/photo-1556881286-fc6915169721?auto=format&fit=crop&w=400&q=80'),
('PECADO', 'con_licor', 'Maracuyá - Cereza - Vodka', 12000, 16000, 24000, 70000, 'https://images.unsplash.com/photo-1546171753-97d7676e4602?auto=format&fit=crop&w=400&q=80'),
('MIAMI', 'con_licor', 'Melocotón - Frutos Rojos - Champagne', 12000, 16000, 24000, 70000, 'https://images.unsplash.com/photo-1536935338788-846bb9981813?auto=format&fit=crop&w=400&q=80'),
('SEX PURPLE', 'con_licor', 'Uva - Frutos Rojos - Ginebra - Vodka', 12000, 16000, 24000, 70000, 'https://images.unsplash.com/photo-1514362545857-3bc16c4c7d1b?auto=format&fit=crop&w=400&q=80'),
('FRESA AGOGO', 'con_licor', 'Fresa - Whisky', 12000, 16000, 24000, 70000, 'https://images.unsplash.com/photo-1572490122747-3968b75cc699?auto=format&fit=crop&w=400&q=80'),
('JOLLY RANCHER', 'con_licor', 'Manzana - Ginebra - Tequila', 12000, 16000, 24000, 70000, 'https://images.unsplash.com/photo-1553530666-ba11a7da3888?auto=format&fit=crop&w=400&q=80'),
('NERDS SANDIA', 'con_licor', 'Sandía - Whisky', 12000, 16000, 24000, 70000, 'https://images.unsplash.com/photo-1546171753-97d7676e4602?auto=format&fit=crop&w=400&q=80'),
('MANGO TEKILA', 'con_licor', 'Mango - Tequila', 12000, 16000, 24000, 70000, 'https://images.unsplash.com/photo-1553530666-ba11a7da3888?auto=format&fit=crop&w=400&q=80'),
('BESO NEGRO', 'con_licor', 'Vodka - Ginebra', 12000, 16000, 24000, 70000, 'https://images.unsplash.com/photo-1514362545857-3bc16c4c7d1b?auto=format&fit=crop&w=400&q=80'),
('CANABIS', 'con_licor', 'Extracto de CBD - Fresa - Whisky - Hierba Buena', 12000, 16000, 24000, 70000, 'https://images.unsplash.com/photo-1513558161293-cdaf765ed2fd?auto=format&fit=crop&w=400&q=80'),
('VODKA BLUE', 'con_licor', 'Sandía - Coco - Vodka', 12000, 16000, 24000, 70000, 'https://images.unsplash.com/photo-1536935338788-846bb9981813?auto=format&fit=crop&w=400&q=80');

-- PRODUCTOS SIN LICOR (8oz: $10k, 12oz: $14k, 24oz: $20k, 100oz Nevera: $60k)
INSERT INTO public.productos (nombre, categoria, ingredientes, precio_8oz, precio_12oz, precio_24oz, precio_100oz, imagen_url) VALUES
('BOM BOM BUM', 'sin_licor', 'Sabor Dulce Bom Bom Bum Frutal', 10000, 14000, 20000, 60000, 'https://images.unsplash.com/photo-1572490122747-3968b75cc699?auto=format&fit=crop&w=400&q=80'),
('MORA AZUL', 'sin_licor', 'Granizado Mora Azul Refrescante', 10000, 14000, 20000, 60000, 'https://images.unsplash.com/photo-1536935338788-846bb9981813?auto=format&fit=crop&w=400&q=80'),
('UVA', 'sin_licor', 'Uva Silvestre Slush', 10000, 14000, 20000, 60000, 'https://images.unsplash.com/photo-1514362545857-3bc16c4c7d1b?auto=format&fit=crop&w=400&q=80'),
('CHICLE', 'sin_licor', 'Sabor Chicle Neón', 10000, 14000, 20000, 60000, 'https://images.unsplash.com/photo-1546171753-97d7676e4602?auto=format&fit=crop&w=400&q=80'),
('CEREZA', 'sin_licor', 'Cereza Roja Tropical', 10000, 14000, 20000, 60000, 'https://images.unsplash.com/photo-1572490122747-3968b75cc699?auto=format&fit=crop&w=400&q=80'),
('MARACUMANGO', 'sin_licor', 'Mezcla Maracuyá y Mango Tropical', 10000, 14000, 20000, 60000, 'https://images.unsplash.com/photo-1553530666-ba11a7da3888?auto=format&fit=crop&w=400&q=80');

-- PRODUCTOS CREMOSOS (8oz: $14k, 12oz: $18k, 24oz: $25k, 100oz Nevera: $65k)
INSERT INTO public.productos (nombre, categoria, ingredientes, precio_8oz, precio_12oz, precio_24oz, precio_100oz, imagen_url) VALUES
('BAILEYS', 'cremoso', 'Crema de café - Whisky', 14000, 18000, 25000, 65000, 'https://images.unsplash.com/photo-1572490122747-3968b75cc699?auto=format&fit=crop&w=400&q=80'),
('SABOR PLAYERO', 'cremoso', 'Crema de coco - Ron Blanco', 14000, 18000, 25000, 65000, 'https://images.unsplash.com/photo-1546171753-97d7676e4602?auto=format&fit=crop&w=400&q=80'),
('ALPINITO FRESA', 'cremoso', 'Sabor Alpinito - Whisky', 14000, 18000, 25000, 65000, 'https://images.unsplash.com/photo-1513558161293-cdaf765ed2fd?auto=format&fit=crop&w=400&q=80'),
('ALPINITO MELOCOTÓN', 'cremoso', 'Sabor Alpinito - Vodka', 14000, 18000, 25000, 65000, 'https://images.unsplash.com/photo-1553530666-ba11a7da3888?auto=format&fit=crop&w=400&q=80');
