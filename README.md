# GST Resto-Bar 🍸 - Sistema de Gestión para Restaurante y Bar

Sistema web integral desarrollado para la gestión de restaurantes y bares ("*A lo más Agogo - Granizados & Flow*"). Permite la visualización de la carta digital mediante códigos QR para clientes, toma de pedidos en mesa para meseros, panel de control de caja y cocina en tiempo real, facturación, impresión de QR y administración de usuarios.

---

## 📋 Tabla de Contenidos

1. [Características Principales](#-características-principales)
2. [Tecnologías Utilizadas](#-tecnologías-utilizadas)
3. [Estructura del Proyecto](#-estructura-del-proyecto)
4. [Base de Datos (Supabase / PostgreSQL)](#-base-de-datos-supabase--postgresql)
5. [Instalación y Configuración Local](#-instalación-y-configuración-local)
6. [Formas de Despliegue](#-formas-de-despliegue)
7. [Licencia](#-licencia)

---

## ✨ Características Principales

- 📱 **Carta Digital QR para Clientes**: Los clientes escanean el código QR de su mesa (`?mesa=X`) y acceden a un menú digital informativo e interactivo con categorías, ingredientes, precios por tamaño (8oz, 12oz, 24oz, 100oz) e imágenes sin necesidad de iniciar sesión.
- 📝 **Toma de Pedidos para Meseros (Rol: `empleado`)**: Creación rápida de comandas asociadas a mesas, selección de tamaños de bebidas, notas especiales y seguimiento en tiempo real del estado del pedido (`pendiente`, `en_preparacion`, `entregado`, `facturado`).
- 💵 **Dashboard de Caja y Cocina (Rol: `admin`)**: 
  - Visualización en tiempo real vía WebSockets (Supabase Realtime) de las órdenes entrantes.
  - Gestión de estados de pedido y cálculo automático de totales.
  - Modal de cobro e impresión/generación de facturas con desglose de métodos de pago (*Efectivo*, *Nequi*, *Daviplata*, *Tarjeta*).
- 🔐 **Autenticación y Control de Acceso por Roles (RBAC)**: Seguridad mediante Supabase Auth con perfiles vinculados y protección de rutas según el rol (`admin` o `empleado`).
- 🖨️ **Generador de Códigos QR para Mesas**: Los administradores pueden visualizar, generar e imprimir los códigos QR correspondientes a cada mesa del establecimiento.
- ⚡ **Modo Mocks / Fallback**: En caso de no contar con conexión a Supabase, el sistema cuenta con datos de prueba integrados para demostraciones o desarrollo offline.

---

## 🛠️ Tecnologías Utilizadas

### Frontend
- **[React 18](https://react.dev/)**: Biblioteca principal para la interfaz de usuario.
- **[Vite 5](https://vitejs.dev/)**: Empaquetador y servidor de desarrollo ultrarrápido.
- **[Tailwind CSS 3](https://tailwindcss.com/)**: Framework CSS de utilidades para un diseño moderno y responsive con soporte de modo oscuro.
- **[Lucide React](https://lucide.dev/)**: Conjunto de iconos vectoriales modernos.
- **[qrcode.react](https://www.npmjs.com/package/qrcode.react)**: Generación dinámicas de códigos QR en el cliente.

### Backend y Persistencia (BaaS)
- **[Supabase](https://supabase.com/)**:
  - **PostgreSQL**: Base de datos relacional.
  - **Supabase Auth**: Autenticación segura de usuarios.
  - **Supabase Realtime**: Suscripción por WebSocket para cambios en la tabla de pedidos.
  - **Row Level Security (RLS)**: Control de seguridad a nivel de filas mediante SQL.

---

## 📁 Estructura del Proyecto

```text
gestion-resto-bar/
├── public/                # Recursos estáticos
├── src/
│   ├── components/        # Componentes reutilizables (Navbar, ProtectedRoute, Modales, etc.)
│   ├── context/           # Contexto de Autenticación (AuthContext.jsx)
│   ├── lib/               # Cliente e inicialización de Supabase (supabase.js)
│   ├── services/          # Servicios API y Mocks (api.js)
│   ├── utils/             # Funciones auxiliares y formateadores
│   ├── views/             # Vistas principales de la aplicación:
│   │   ├── CajaView.jsx       # Dashboard de Caja, Cocina y Facturación
│   │   ├── ClientMenuView.jsx # Carta Digital para clientes por QR
│   │   ├── FacturaModal.jsx   # Generación de comprobantes y cobro
│   │   ├── LoginView.jsx      # Autenticación de personal
│   │   ├── MesasQrView.jsx    # Administración e impresión de QRs
│   │   ├── MeseroView.jsx     # Toma de pedidos en mesa
│   │   └── UsuariosView.jsx   # Gestión de cuentas de empleados
│   ├── App.jsx            # Enrutamiento de vistas por rol/parámetros
│   ├── main.jsx           # Punto de entrada de la aplicación
│   └── index.css          # Estilos globales y Tailwind CSS
├── supabase/
│   └── schema.sql         # Script SQL completo de creación de base de datos
├── .env.example           # Variables de entorno de ejemplo
├── render.yaml            # Archivo de configuración de despliegue en Render
├── tailwind.config.js     # Configuración de Tailwind CSS
├── vite.config.js         # Configuración de Vite
└── package.json           # Dependencias y scripts del proyecto
```

---

## 🗄️ Base de Datos (Supabase / PostgreSQL)

El archivo [`supabase/schema.sql`](file:///c:/proyectos/gestion-resto-bar/supabase/schema.sql) contiene la estructura completa del sistema de base de datos.

### Tablas Principales

1. **`perfiles`**:
   - Vinculada a `auth.users` de Supabase mediante Foreign Key (`ON DELETE CASCADE`).
   - Campos: `id` (UUID), `email`, `nombre`, `rol` ('admin' | 'empleado').
   - **Trigger `on_auth_user_created`**: Al registrar un usuario en Supabase Auth, se genera automáticamente su perfil en esta tabla.

2. **`productos`**:
   - Catálogo de bebidas y granizados.
   - Campos: `id`, `nombre`, `categoria` ('con_licor' | 'sin_licor' | 'cremoso'), `ingredientes`, `precio_8oz`, `precio_12oz`, `precio_24oz`, `precio_100oz`, `activo`, `imagen_url`.

3. **`mesas`**:
   - Control de mesas disponibles en el bar.
   - Campos: `id`, `numero_mesa`, `qr_code_url`, `estado` ('disponible' | 'ocupada').

4. **`pedidos`**:
   - Encabezado del pedido realizado en mesa.
   - Campos: `id`, `mesa_id`, `estado` ('pendiente' | 'en_preparacion' | 'entregado' | 'facturado'), `total`, `metodo_pago` ('efectivo' | 'nequi' | 'daviplata' | 'tarjeta'), `notas`.
   - Publicación en `supabase_realtime` activada para notificaciones en vivo.

5. **`detalle_pedido`**:
   - Detalle de ítems por pedido.
   - Campos: `id`, `pedido_id`, `producto_id`, `tamano` ('8oz' | '12oz' | '24oz' | '100oz'), `cantidad`, `precio_unitario`, `subtotal` (columna generada `cantidad * precio_unitario`).

### Seguridad y RLS (Row Level Security)

- La función auxilar `es_admin()` se ejecuta con `SECURITY DEFINER` para consultar el rol del usuario autenticado evitando loops de recursión RLS (`42P17`).
- Políticas RLS aplicadas:
  - Lectura pública para `productos`, `mesas` y `pedidos` (permite visualización en menú QR).
  - Modificación de catálogo restringida exclusivamente a usuarios con rol `admin`.
  - Actualización de pedidos restringida una vez pasen a estado `facturado`.

---

## 🚀 Instalación y Configuración Local

### Requisitos Previos
- **Node.js** (v18.0.0 o superior)
- **npm** o **yarn**
- Proyecto activo en [Supabase](https://supabase.com/) (Opcional si usas modo offline/mocks).

### Pasos

1. **Clonar el repositorio**:
   ```bash
   git clone <URL_DEL_REPOSITORIO>
   cd gestion-resto-bar
   ```

2. **Instalar dependencias**:
   ```bash
   npm install
   ```

3. **Configurar Variables de Entorno**:
   Copia el archivo `.env.example` como `.env`:
   ```bash
   cp .env.example .env
   ```
   Edita `.env` con las credenciales de tu proyecto en Supabase:
   ```env
   VITE_SUPABASE_URL=https://tu-proyecto.supabase.co
   VITE_SUPABASE_ANON_KEY=tu-anon-key-aqui
   ```

4. **Ejecutar el esquema de Base de Datos**:
   - Ve al **SQL Editor** de tu proyecto en Supabase.
   - Copia y pega el contenido del archivo [`supabase/schema.sql`](file:///c:/proyectos/gestion-resto-bar/supabase/schema.sql) y ejecuta las sentencias. Esto creará las tablas, roles, funciones RLS, datos semilla e integrará la publicación Realtime.

5. **Iniciar en entorno de desarrollo**:
   ```bash
   npm run dev
   ```
   Abre tu navegador en `http://localhost:5173`.

---

## 🌐 Formas de Despliegue

### 1. Despliegue en Render (Recomendado)

El proyecto incluye una plantilla de configuración [`render.yaml`](file:///c:/proyectos/gestion-resto-bar/render.yaml) preconfigurada para sitios estáticos en Render:

1. Conecta tu repositorio de GitHub/GitLab a **Render**.
2. Selecciona **New +** -> **Blueprint**.
3. Render detectará automáticamente `render.yaml`.
4. Define las variables de entorno en el panel de Render:
   - `VITE_SUPABASE_URL`
   - `VITE_SUPABASE_ANON_KEY`
5. El proceso de Build ejecutará:
   ```bash
   npm install && chmod +x node_modules/.bin/* && npm run build
   ```
6. El directorio publicado será `./dist` con reescritura de rutas SPA habilitada (`/* -> /index.html`).

### 2. Despliegue en Vercel / Netlify

1. Importa el proyecto desde tu proveedor Git.
2. Configura el comando de build: `npm run build`.
3. Configura la carpeta de salida (Output Directory): `dist`.
4. Agrega las variables de entorno `VITE_SUPABASE_URL` y `VITE_SUPABASE_ANON_KEY`.
5. Asegúrate de configurar la regla de reescritura de rutas para SPA (*Single Page Application*) hacia `/index.html`.

### 3. Build Producción Manual / Nginx / Docker

Si deseas servir la aplicación mediante Nginx o un servidor estático propio:

```bash
npm run build
```

El comando generará la carpeta comprimida y optimizada `dist/`. Configura tu servidor web para redirigir todas las solicitudes no encontradas a `dist/index.html`.

---

## 📜 Licencia

Desarrollado para **Alo Mas Agogo - Granizados & Flow** (GST-Software). Todos los derechos reservados.
