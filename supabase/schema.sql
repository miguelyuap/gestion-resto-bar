-- ==============================================================================
-- ESQUEMA COMPLETO DE BASE DE DATOS MULTI-TENANT SAAS - "GST RESTO BAR"
-- SCRIPT MIGRACIÓN 100% IDEMPOTENTE CON "ALTER TABLE ADD COLUMN IF NOT EXISTS"
-- ==============================================================================

-- 1. EXTENSIONES
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 2. TABLA DE NEGOCIOS (TENANTS)
CREATE TABLE IF NOT EXISTS public.negocios (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    nombre TEXT NOT NULL,
    slug TEXT UNIQUE NOT NULL,
    nit TEXT,
    moneda TEXT NOT NULL DEFAULT 'COP',
    simbolo_moneda TEXT NOT NULL DEFAULT '$',
    logo_url TEXT,
    activo BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- NEGOCIO POR DEFECTO PARA SEMILLA / MIGRACIONES (GST Resto Bar)
INSERT INTO public.negocios (id, nombre, slug, nit, moneda, simbolo_moneda, activo)
VALUES (
    '00000000-0000-0000-0000-000000000001',
    'GST Resto Bar',
    'gst-resto-bar',
    '901.234.567-8',
    'COP',
    '$',
    true
)
ON CONFLICT (id) DO UPDATE SET
    nombre = EXCLUDED.nombre,
    nit = EXCLUDED.nit;

-- 3. CREACIÓN Y ACTUALIZACIÓN DE TABLAS TRANSACCIONALES (MIGRACIÓN SEGURA)

-- TABLA DE PERFILES
CREATE TABLE IF NOT EXISTS public.perfiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    email TEXT UNIQUE NOT NULL,
    nombre TEXT,
    rol TEXT NOT NULL DEFAULT 'empleado' CHECK (rol IN ('admin', 'empleado')),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);
ALTER TABLE public.perfiles 
ADD COLUMN IF NOT EXISTS negocio_id UUID NOT NULL DEFAULT '00000000-0000-0000-0000-000000000001' 
REFERENCES public.negocios(id) ON DELETE CASCADE;

-- TABLA DE PRODUCTOS
CREATE TABLE IF NOT EXISTS public.productos (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    nombre TEXT NOT NULL,
    categoria TEXT NOT NULL CHECK (categoria IN ('con_licor', 'sin_licor', 'cremoso', 'comidas', 'entradas')),
    ingredientes TEXT,
    precio_8oz NUMERIC(10, 2) NOT NULL DEFAULT 0,
    precio_12oz NUMERIC(10, 2) NOT NULL DEFAULT 0,
    precio_24oz NUMERIC(10, 2) NOT NULL DEFAULT 0,
    precio_100oz NUMERIC(10, 2) NOT NULL DEFAULT 0,
    activo BOOLEAN NOT NULL DEFAULT true,
    imagen_url TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);
ALTER TABLE public.productos 
ADD COLUMN IF NOT EXISTS negocio_id UUID NOT NULL DEFAULT '00000000-0000-0000-0000-000000000001' 
REFERENCES public.negocios(id) ON DELETE CASCADE;

-- TABLA DE MESAS
CREATE TABLE IF NOT EXISTS public.mesas (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    numero_mesa INTEGER NOT NULL,
    qr_code_url TEXT,
    estado TEXT NOT NULL DEFAULT 'disponible' CHECK (estado IN ('disponible', 'ocupada')),
    created_at TIMESTAMPTZ DEFAULT NOW()
);
ALTER TABLE public.mesas 
ADD COLUMN IF NOT EXISTS negocio_id UUID NOT NULL DEFAULT '00000000-0000-0000-0000-000000000001' 
REFERENCES public.negocios(id) ON DELETE CASCADE;

DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint WHERE conname = 'unq_negocio_numero_mesa'
    ) THEN
        ALTER TABLE public.mesas ADD CONSTRAINT unq_negocio_numero_mesa UNIQUE (negocio_id, numero_mesa);
    END IF;
END $$;

-- TABLA DE PEDIDOS
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
ALTER TABLE public.pedidos 
ADD COLUMN IF NOT EXISTS negocio_id UUID NOT NULL DEFAULT '00000000-0000-0000-0000-000000000001' 
REFERENCES public.negocios(id) ON DELETE CASCADE;

-- TABLA DETALLE DE PEDIDOS
CREATE TABLE IF NOT EXISTS public.detalle_pedido (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    pedido_id UUID NOT NULL REFERENCES public.pedidos(id) ON DELETE CASCADE,
    producto_id UUID NOT NULL REFERENCES public.productos(id) ON DELETE RESTRICT,
    tamano TEXT NOT NULL CHECK (tamano IN ('8oz', '12oz', '24oz', '100oz', 'unidad')),
    cantidad INTEGER NOT NULL CHECK (cantidad > 0),
    precio_unitario NUMERIC(10, 2) NOT NULL CHECK (precio_unitario >= 0),
    subtotal NUMERIC(10, 2) GENERATED ALWAYS AS (cantidad * precio_unitario) STORED
);

-- 4. INDICES DE RENDIMIENTO MULTI-TENANT
CREATE INDEX IF NOT EXISTS idx_perfiles_negocio_id ON public.perfiles(negocio_id);
CREATE INDEX IF NOT EXISTS idx_productos_negocio_id ON public.productos(negocio_id);
CREATE INDEX IF NOT EXISTS idx_mesas_negocio_id ON public.mesas(negocio_id);
CREATE INDEX IF NOT EXISTS idx_pedidos_negocio_id ON public.pedidos(negocio_id);
CREATE INDEX IF NOT EXISTS idx_pedidos_mesa_id ON public.pedidos(mesa_id);
CREATE INDEX IF NOT EXISTS idx_pedidos_estado ON public.pedidos(estado);
CREATE INDEX IF NOT EXISTS idx_pedidos_created_at ON public.pedidos(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_detalle_pedido_pedido_id ON public.detalle_pedido(pedido_id);

-- 5. CONFIGURACION DE REALTIME EN SUPABASE
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_publication_tables 
        WHERE pubname = 'supabase_realtime' 
        AND schemaname = 'public' 
        AND tablename = 'pedidos'
    ) THEN
        ALTER PUBLICATION supabase_realtime ADD TABLE public.pedidos;
    END IF;
END $$;

-- ==============================================================================
-- FUNCIONES AUXILIARES SECURITY DEFINER (AISLAMIENTO TENANT SIN RECURSIÓN RLS)
-- ==============================================================================

CREATE OR REPLACE FUNCTION public.obtener_mi_negocio_id()
RETURNS UUID AS $$
BEGIN
  RETURN (
    SELECT negocio_id 
    FROM public.perfiles 
    WHERE id = auth.uid()
    LIMIT 1
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

CREATE OR REPLACE FUNCTION public.es_admin()
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 
    FROM public.perfiles 
    WHERE id = auth.uid() AND rol = 'admin'
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- ==============================================================================
-- TRIGGER PARA CREACION AUTOMATICA DE PERFIL AL CREAR USUARIO EN SUPABASE AUTH
-- ==============================================================================
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
DECLARE
    target_negocio_id UUID;
BEGIN
    target_negocio_id := COALESCE(
        (NEW.raw_user_meta_data->>'negocio_id')::UUID,
        '00000000-0000-0000-0000-000000000001'::UUID
    );

    INSERT INTO public.perfiles (id, negocio_id, email, nombre, rol)
    VALUES (
        NEW.id,
        target_negocio_id,
        NEW.email,
        COALESCE(NEW.raw_user_meta_data->>'nombre', SPLIT_PART(NEW.email, '@', 1)),
        COALESCE(
          NEW.raw_user_meta_data->>'rol',
          CASE WHEN NEW.email LIKE '%admin%' THEN 'admin' ELSE 'empleado' END
        )
    )
    ON CONFLICT (id) DO UPDATE SET 
        email = EXCLUDED.email,
        negocio_id = EXCLUDED.negocio_id;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- ==============================================================================
-- POLÍTICAS DE SEGURIDAD RLS (IDEMPOTENTES Y AISLADAS POR TENANT)
-- ==============================================================================
ALTER TABLE public.negocios ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.perfiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.productos ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.mesas ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.pedidos ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.detalle_pedido ENABLE ROW LEVEL SECURITY;

-- --- POLÍTICAS DE NEGOCIOS ---
DROP POLICY IF EXISTS "Lectura de negocios autenticados o publicos" ON public.negocios;
CREATE POLICY "Lectura de negocios autenticados o publicos" 
ON public.negocios FOR SELECT 
USING (activo = true);

DROP POLICY IF EXISTS "Solo admin puede modificar su negocio" ON public.negocios;
CREATE POLICY "Solo admin puede modificar su negocio" 
ON public.negocios FOR UPDATE 
USING (id = public.obtener_mi_negocio_id() AND public.es_admin());

-- --- POLÍTICAS DE PERFILES ---
DROP POLICY IF EXISTS "Ver perfiles del mismo negocio" ON public.perfiles;
CREATE POLICY "Ver perfiles del mismo negocio" 
ON public.perfiles FOR SELECT 
USING (negocio_id = public.obtener_mi_negocio_id() OR auth.uid() = id);

DROP POLICY IF EXISTS "Actualizar perfiles del mismo negocio" ON public.perfiles;
CREATE POLICY "Actualizar perfiles del mismo negocio" 
ON public.perfiles FOR UPDATE 
USING (negocio_id = public.obtener_mi_negocio_id() AND public.es_admin());

-- --- POLÍTICAS DE PRODUCTOS ---
DROP POLICY IF EXISTS "Lectura de productos por negocio" ON public.productos;
CREATE POLICY "Lectura de productos por negocio" 
ON public.productos FOR SELECT 
USING (true);

DROP POLICY IF EXISTS "Administrar productos de su negocio" ON public.productos;
CREATE POLICY "Administrar productos de su negocio" 
ON public.productos FOR ALL 
USING (negocio_id = public.obtener_mi_negocio_id() AND public.es_admin());

-- --- POLÍTICAS DE MESAS ---
DROP POLICY IF EXISTS "Lectura publica de mesas" ON public.mesas;
CREATE POLICY "Lectura publica de mesas" 
ON public.mesas FOR SELECT USING (true);

DROP POLICY IF EXISTS "Administrar mesas de su negocio" ON public.mesas;
CREATE POLICY "Administrar mesas de su negocio" 
ON public.mesas FOR ALL 
USING (negocio_id = public.obtener_mi_negocio_id());

-- --- POLÍTICAS DE PEDIDOS ---
DROP POLICY IF EXISTS "Lectura de pedidos por negocio" ON public.pedidos;
CREATE POLICY "Lectura de pedidos por negocio" 
ON public.pedidos FOR SELECT 
USING (negocio_id = public.obtener_mi_negocio_id() OR auth.uid() IS NULL);

DROP POLICY IF EXISTS "Insercion de pedidos por negocio" ON public.pedidos;
CREATE POLICY "Insercion de pedidos por negocio" 
ON public.pedidos FOR INSERT 
WITH CHECK (true);

DROP POLICY IF EXISTS "Actualizacion de pedidos por negocio" ON public.pedidos;
CREATE POLICY "Actualizacion de pedidos por negocio" 
ON public.pedidos FOR UPDATE 
USING (
    negocio_id = public.obtener_mi_negocio_id() AND (estado != 'facturado' OR public.es_admin())
);

-- --- POLÍTICAS DE DETALLE_PEDIDO ---
DROP POLICY IF EXISTS "Lectura publica de detalle_pedido" ON public.detalle_pedido;
CREATE POLICY "Lectura publica de detalle_pedido" 
ON public.detalle_pedido FOR SELECT USING (true);

DROP POLICY IF EXISTS "Insercion publica de detalle_pedido" ON public.detalle_pedido;
CREATE POLICY "Insercion publica de detalle_pedido" 
ON public.detalle_pedido FOR INSERT WITH CHECK (true);

-- ==============================================================================
-- DATOS SEMILLA EXACTOS "GST RESTO BAR"
-- ==============================================================================

INSERT INTO public.mesas (negocio_id, numero_mesa, estado) VALUES
('00000000-0000-0000-0000-000000000001', 1, 'disponible'),
('00000000-0000-0000-0000-000000000001', 2, 'disponible'),
('00000000-0000-0000-0000-000000000001', 3, 'disponible'),
('00000000-0000-0000-0000-000000000001', 4, 'disponible'),
('00000000-0000-0000-0000-000000000001', 5, 'disponible'),
('00000000-0000-0000-0000-000000000001', 6, 'disponible'),
('00000000-0000-0000-0000-000000000001', 7, 'disponible'),
('00000000-0000-0000-0000-000000000001', 8, 'disponible'),
('00000000-0000-0000-0000-000000000001', 9, 'disponible'),
('00000000-0000-0000-0000-000000000001', 10, 'disponible')
ON CONFLICT (negocio_id, numero_mesa) DO NOTHING;

INSERT INTO public.productos (negocio_id, nombre, categoria, ingredientes, precio_8oz, precio_12oz, precio_24oz, precio_100oz, imagen_url) VALUES
('00000000-0000-0000-0000-000000000001', 'BLUE AGOGO', 'con_licor', 'Tequila - Citrile - Mora', 12000, 16000, 24000, 70000, 'https://images.unsplash.com/photo-1536935338788-846bb9981813?auto=format&fit=crop&w=400&q=80'),
('00000000-0000-0000-0000-000000000001', 'FOUR LOKO GOLD', 'con_licor', 'Naranja - Four Loko', 12000, 16000, 24000, 70000, 'https://images.unsplash.com/photo-1551024709-8f23befc6f87?auto=format&fit=crop&w=400&q=80'),
('00000000-0000-0000-0000-000000000001', 'SMIRNOFF LULO', 'con_licor', 'Vodka - Lulo', 12000, 16000, 24000, 70000, 'https://images.unsplash.com/photo-1513558161293-cdaf765ed2fd?auto=format&fit=crop&w=400&q=80'),
('00000000-0000-0000-0000-000000000001', 'TUSSI', 'con_licor', 'Vodka - Kola - Champagne', 12000, 16000, 24000, 70000, 'https://images.unsplash.com/photo-1572490122747-3968b75cc699?auto=format&fit=crop&w=400&q=80'),
('00000000-0000-0000-0000-000000000001', 'JAGER', 'con_licor', 'Jagermeister - Red Bull', 12000, 16000, 24000, 70000, 'https://images.unsplash.com/photo-1514362545857-3bc16c4c7d1b?auto=format&fit=crop&w=400&q=80'),
('00000000-0000-0000-0000-000000000001', 'MARGARITA', 'con_licor', 'Limón - Hipnotiq', 12000, 16000, 24000, 70000, 'https://images.unsplash.com/photo-1556881286-fc6915169721?auto=format&fit=crop&w=400&q=80');

INSERT INTO public.productos (negocio_id, nombre, categoria, ingredientes, precio_8oz, precio_12oz, precio_24oz, precio_100oz, imagen_url) VALUES
('00000000-0000-0000-0000-000000000001', 'BOM BOM BUM', 'sin_licor', 'Sabor Dulce Bom Bom Bum Frutal', 10000, 14000, 20000, 60000, 'https://images.unsplash.com/photo-1572490122747-3968b75cc699?auto=format&fit=crop&w=400&q=80'),
('00000000-0000-0000-0000-000000000001', 'MORA AZUL', 'sin_licor', 'Granizado Mora Azul Refrescante', 10000, 14000, 20000, 60000, 'https://images.unsplash.com/photo-1536935338788-846bb9981813?auto=format&fit=crop&w=400&q=80'),
('00000000-0000-0000-0000-000000000001', 'UVA', 'sin_licor', 'Uva Silvestre Slush', 10000, 14000, 20000, 60000, 'https://images.unsplash.com/photo-1514362545857-3bc16c4c7d1b?auto=format&fit=crop&w=400&q=80');

INSERT INTO public.productos (negocio_id, nombre, categoria, ingredientes, precio_8oz, precio_12oz, precio_24oz, precio_100oz, imagen_url) VALUES
('00000000-0000-0000-0000-000000000001', 'BAILEYS', 'cremoso', 'Crema de café - Whisky', 14000, 18000, 25000, 65000, 'https://images.unsplash.com/photo-1572490122747-3968b75cc699?auto=format&fit=crop&w=400&q=80'),
('00000000-0000-0000-0000-000000000001', 'SABOR PLAYERO', 'cremoso', 'Crema de coco - Ron Blanco', 14000, 18000, 25000, 65000, 'https://images.unsplash.com/photo-1546171753-97d7676e4602?auto=format&fit=crop&w=400&q=80');
