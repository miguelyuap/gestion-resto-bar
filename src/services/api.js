import { supabase, isSupabaseConfigured } from '../lib/supabase';

// MENÚ COMPLETO Y EXACTO DE "GRANIZADOS & FLOW - A LO MÁS AGOGO"
const MOCK_PRODUCTS = [
  // --- GRANIZADOS CON LICOR (8oz: $12k, 12oz: $16k, 24oz: $24k, 100oz: $70k) ---
  {
    id: 'prod-1',
    nombre: 'BLUE AGOGO',
    categoria: 'con_licor',
    ingredientes: 'Tequila - Citrile - Mora',
    precio_8oz: 12000,
    precio_12oz: 16000,
    precio_24oz: 24000,
    precio_100oz: 70000,
    activo: true,
    imagen_url: 'https://images.unsplash.com/photo-1536935338788-846bb9981813?auto=format&fit=crop&w=400&q=80'
  },
  {
    id: 'prod-2',
    nombre: 'FOUR LOKO GOLD',
    categoria: 'con_licor',
    ingredientes: 'Naranja - Four Loko',
    precio_8oz: 12000,
    precio_12oz: 16000,
    precio_24oz: 24000,
    precio_100oz: 70000,
    activo: true,
    imagen_url: 'https://images.unsplash.com/photo-1551024709-8f23befc6f87?auto=format&fit=crop&w=400&q=80'
  },
  {
    id: 'prod-3',
    nombre: 'SMIRNOFF LULO',
    categoria: 'con_licor',
    ingredientes: 'Vodka - Lulo',
    precio_8oz: 12000,
    precio_12oz: 16000,
    precio_24oz: 24000,
    precio_100oz: 70000,
    activo: true,
    imagen_url: 'https://images.unsplash.com/photo-1513558161293-cdaf765ed2fd?auto=format&fit=crop&w=400&q=80'
  },
  {
    id: 'prod-4',
    nombre: 'TUSSI',
    categoria: 'con_licor',
    ingredientes: 'Vodka - Kola - Champagne',
    precio_8oz: 12000,
    precio_12oz: 16000,
    precio_24oz: 24000,
    precio_100oz: 70000,
    activo: true,
    imagen_url: 'https://images.unsplash.com/photo-1572490122747-3968b75cc699?auto=format&fit=crop&w=400&q=80'
  },
  {
    id: 'prod-5',
    nombre: 'JAGER',
    categoria: 'con_licor',
    ingredientes: 'Jagermeister - Red Bull',
    precio_8oz: 12000,
    precio_12oz: 16000,
    precio_24oz: 24000,
    precio_100oz: 70000,
    activo: true,
    imagen_url: 'https://images.unsplash.com/photo-1514362545857-3bc16c4c7d1b?auto=format&fit=crop&w=400&q=80'
  },
  {
    id: 'prod-6',
    nombre: 'MARGARITA',
    categoria: 'con_licor',
    ingredientes: 'Limón - Hipnotiq',
    precio_8oz: 12000,
    precio_12oz: 16000,
    precio_24oz: 24000,
    precio_100oz: 70000,
    activo: true,
    imagen_url: 'https://images.unsplash.com/photo-1556881286-fc6915169721?auto=format&fit=crop&w=400&q=80'
  },
  {
    id: 'prod-7',
    nombre: 'PECADO',
    categoria: 'con_licor',
    ingredientes: 'Maracuyá - Cereza - Vodka',
    precio_8oz: 12000,
    precio_12oz: 16000,
    precio_24oz: 24000,
    precio_100oz: 70000,
    activo: true,
    imagen_url: 'https://images.unsplash.com/photo-1546171753-97d7676e4602?auto=format&fit=crop&w=400&q=80'
  },
  {
    id: 'prod-8',
    nombre: 'MIAMI',
    categoria: 'con_licor',
    ingredientes: 'Melocotón - Frutos Rojos - Champagne',
    precio_8oz: 12000,
    precio_12oz: 16000,
    precio_24oz: 24000,
    precio_100oz: 70000,
    activo: true,
    imagen_url: 'https://images.unsplash.com/photo-1536935338788-846bb9981813?auto=format&fit=crop&w=400&q=80'
  },
  {
    id: 'prod-9',
    nombre: 'SEX PURPLE',
    categoria: 'con_licor',
    ingredientes: 'Uva - Frutos Rojos - Ginebra - Vodka',
    precio_8oz: 12000,
    precio_12oz: 16000,
    precio_24oz: 24000,
    precio_100oz: 70000,
    activo: true,
    imagen_url: 'https://images.unsplash.com/photo-1514362545857-3bc16c4c7d1b?auto=format&fit=crop&w=400&q=80'
  },
  {
    id: 'prod-10',
    nombre: 'FRESA AGOGO',
    categoria: 'con_licor',
    ingredientes: 'Fresa - Whisky',
    precio_8oz: 12000,
    precio_12oz: 16000,
    precio_24oz: 24000,
    precio_100oz: 70000,
    activo: true,
    imagen_url: 'https://images.unsplash.com/photo-1572490122747-3968b75cc699?auto=format&fit=crop&w=400&q=80'
  },
  {
    id: 'prod-11',
    nombre: 'JOLLY RANCHER',
    categoria: 'con_licor',
    ingredientes: 'Manzana - Ginebra - Tequila',
    precio_8oz: 12000,
    precio_12oz: 16000,
    precio_24oz: 24000,
    precio_100oz: 70000,
    activo: true,
    imagen_url: 'https://images.unsplash.com/photo-1553530666-ba11a7da3888?auto=format&fit=crop&w=400&q=80'
  },
  {
    id: 'prod-12',
    nombre: 'NERDS SANDIA',
    categoria: 'con_licor',
    ingredientes: 'Sandía - Whisky',
    precio_8oz: 12000,
    precio_12oz: 16000,
    precio_24oz: 24000,
    precio_100oz: 70000,
    activo: true,
    imagen_url: 'https://images.unsplash.com/photo-1546171753-97d7676e4602?auto=format&fit=crop&w=400&q=80'
  },
  {
    id: 'prod-13',
    nombre: 'MANGO TEKILA',
    categoria: 'con_licor',
    ingredientes: 'Mango - Tequila',
    precio_8oz: 12000,
    precio_12oz: 16000,
    precio_24oz: 24000,
    precio_100oz: 70000,
    activo: true,
    imagen_url: 'https://images.unsplash.com/photo-1553530666-ba11a7da3888?auto=format&fit=crop&w=400&q=80'
  },
  {
    id: 'prod-14',
    nombre: 'BESO NEGRO',
    categoria: 'con_licor',
    ingredientes: 'Vodka - Ginebra',
    precio_8oz: 12000,
    precio_12oz: 16000,
    precio_24oz: 24000,
    precio_100oz: 70000,
    activo: true,
    imagen_url: 'https://images.unsplash.com/photo-1514362545857-3bc16c4c7d1b?auto=format&fit=crop&w=400&q=80'
  },
  {
    id: 'prod-15',
    nombre: 'CANABIS',
    categoria: 'con_licor',
    ingredientes: 'Extracto de CBD - Fresa - Whisky - Hierba Buena',
    precio_8oz: 12000,
    precio_12oz: 16000,
    precio_24oz: 24000,
    precio_100oz: 70000,
    activo: true,
    imagen_url: 'https://images.unsplash.com/photo-1513558161293-cdaf765ed2fd?auto=format&fit=crop&w=400&q=80'
  },
  {
    id: 'prod-16',
    nombre: 'VODKA BLUE',
    categoria: 'con_licor',
    ingredientes: 'Sandía - Coco - Vodka',
    precio_8oz: 12000,
    precio_12oz: 16000,
    precio_24oz: 24000,
    precio_100oz: 70000,
    activo: true,
    imagen_url: 'https://images.unsplash.com/photo-1536935338788-846bb9981813?auto=format&fit=crop&w=400&q=80'
  },

  // --- GRANIZADOS SIN LICOR (8oz: $10k, 12oz: $14k, 24oz: $20k, 100oz: $60k) ---
  {
    id: 'prod-17',
    nombre: 'BOM BOM BUM',
    categoria: 'sin_licor',
    ingredientes: 'Sabor Dulce Bom Bom Bum Frutal',
    precio_8oz: 10000,
    precio_12oz: 14000,
    precio_24oz: 20000,
    precio_100oz: 60000,
    activo: true,
    imagen_url: 'https://images.unsplash.com/photo-1572490122747-3968b75cc699?auto=format&fit=crop&w=400&q=80'
  },
  {
    id: 'prod-18',
    nombre: 'MORA AZUL',
    categoria: 'sin_licor',
    ingredientes: 'Granizado Mora Azul Refrescante',
    precio_8oz: 10000,
    precio_12oz: 14000,
    precio_24oz: 20000,
    precio_100oz: 60000,
    activo: true,
    imagen_url: 'https://images.unsplash.com/photo-1536935338788-846bb9981813?auto=format&fit=crop&w=400&q=80'
  },
  {
    id: 'prod-19',
    nombre: 'UVA',
    categoria: 'sin_licor',
    ingredientes: 'Uva Silvestre Slush',
    precio_8oz: 10000,
    precio_12oz: 14000,
    precio_24oz: 20000,
    precio_100oz: 60000,
    activo: true,
    imagen_url: 'https://images.unsplash.com/photo-1514362545857-3bc16c4c7d1b?auto=format&fit=crop&w=400&q=80'
  },
  {
    id: 'prod-20',
    nombre: 'CHICLE',
    categoria: 'sin_licor',
    ingredientes: 'Sabor Chicle Neón',
    precio_8oz: 10000,
    precio_12oz: 14000,
    precio_24oz: 20000,
    precio_100oz: 60000,
    activo: true,
    imagen_url: 'https://images.unsplash.com/photo-1546171753-97d7676e4602?auto=format&fit=crop&w=400&q=80'
  },
  {
    id: 'prod-21',
    nombre: 'CEREZA',
    categoria: 'sin_licor',
    ingredientes: 'Cereza Roja Tropical',
    precio_8oz: 10000,
    precio_12oz: 14000,
    precio_24oz: 20000,
    precio_100oz: 60000,
    activo: true,
    imagen_url: 'https://images.unsplash.com/photo-1572490122747-3968b75cc699?auto=format&fit=crop&w=400&q=80'
  },
  {
    id: 'prod-22',
    nombre: 'MARACUMANGO',
    categoria: 'sin_licor',
    ingredientes: 'Mezcla Maracuyá y Mango Tropical',
    precio_8oz: 10000,
    precio_12oz: 14000,
    precio_24oz: 20000,
    precio_100oz: 60000,
    activo: true,
    imagen_url: 'https://images.unsplash.com/photo-1553530666-ba11a7da3888?auto=format&fit=crop&w=400&q=80'
  },

  // --- GRANIZADOS CREMOSOS (8oz: $14k, 12oz: $18k, 24oz: $25k, 100oz: $65k) ---
  {
    id: 'prod-23',
    nombre: 'BAILEYS',
    categoria: 'cremoso',
    ingredientes: 'Crema de café - Whisky',
    precio_8oz: 14000,
    precio_12oz: 18000,
    precio_24oz: 25000,
    precio_100oz: 65000,
    activo: true,
    imagen_url: 'https://images.unsplash.com/photo-1572490122747-3968b75cc699?auto=format&fit=crop&w=400&q=80'
  },
  {
    id: 'prod-24',
    nombre: 'SABOR PLAYERO',
    categoria: 'cremoso',
    ingredientes: 'Crema de coco - Ron Blanco',
    precio_8oz: 14000,
    precio_12oz: 18000,
    precio_24oz: 25000,
    precio_100oz: 65000,
    activo: true,
    imagen_url: 'https://images.unsplash.com/photo-1546171753-97d7676e4602?auto=format&fit=crop&w=400&q=80'
  },
  {
    id: 'prod-25',
    nombre: 'ALPINITO FRESA',
    categoria: 'cremoso',
    ingredientes: 'Sabor Alpinito - Whisky',
    precio_8oz: 14000,
    precio_12oz: 18000,
    precio_24oz: 25000,
    precio_100oz: 65000,
    activo: true,
    imagen_url: 'https://images.unsplash.com/photo-1513558161293-cdaf765ed2fd?auto=format&fit=crop&w=400&q=80'
  },
  {
    id: 'prod-26',
    nombre: 'ALPINITO MELOCOTÓN',
    categoria: 'cremoso',
    ingredientes: 'Sabor Alpinito - Vodka',
    precio_8oz: 14000,
    precio_12oz: 18000,
    precio_24oz: 25000,
    precio_100oz: 65000,
    activo: true,
    imagen_url: 'https://images.unsplash.com/photo-1553530666-ba11a7da3888?auto=format&fit=crop&w=400&q=80'
  }
];

const MOCK_MESAS = Array.from({ length: 10 }, (_, i) => ({
  id: `mesa-uuid-${i + 1}`,
  numero_mesa: i + 1,
  estado: 'disponible'
}));

let mockOrders = [];
let mockListeners = [];

const notifyMockListeners = (event, payload) => {
  mockListeners.forEach(fn => fn(event, payload));
};

export const apiService = {
  async getProductos() {
    if (isSupabaseConfigured) {
      const { data, error } = await supabase
        .from('productos')
        .select('*')
        .eq('activo', true)
        .order('categoria', { ascending: true });
      if (error) throw error;
      return data;
    }
    return MOCK_PRODUCTS;
  },

  async getMesas() {
    if (isSupabaseConfigured) {
      const { data: mesasData, error: errMesas } = await supabase
        .from('mesas')
        .select('*')
        .order('numero_mesa', { ascending: true });
      if (errMesas) throw errMesas;

      const { data: pedidosActivos } = await supabase
        .from('pedidos')
        .select('*, detalle_pedido(*)')
        .neq('estado', 'facturado');

      return mesasData.map(m => {
        const pActivo = pedidosActivos?.find(p => p.mesa_id === m.id);
        return {
          ...m,
          estado: pActivo ? 'ocupada' : 'disponible',
          pedidoActivo: pActivo || null
        };
      });
    }

    return MOCK_MESAS.map(m => {
      const pActivo = mockOrders.find(p => p.mesa_id === m.id && p.estado !== 'facturado');
      return {
        ...m,
        estado: pActivo ? 'ocupada' : 'disponible',
        pedidoActivo: pActivo || null
      };
    });
  },

  async crearPedido({ mesa_id, items, total, notas, meseroNombre }) {
    const notasCompletas = meseroNombre 
      ? `[Mesero: ${meseroNombre}] ${notas || ''}`.trim()
      : (notas || '');

    if (isSupabaseConfigured) {
      const { data: pedido, error: errPedido } = await supabase
        .from('pedidos')
        .insert([
          {
            mesa_id,
            total,
            estado: 'pendiente',
            notas: notasCompletas
          }
        ])
        .select()
        .single();

      if (errPedido) throw errPedido;

      const detalles = items.map(item => ({
        pedido_id: pedido.id,
        producto_id: item.producto.id,
        tamano: item.tamano,
        cantidad: item.cantidad,
        precio_unitario: item.precio_unitario
      }));

      const { error: errDetalle } = await supabase
        .from('detalle_pedido')
        .insert(detalles);

      if (errDetalle) throw errDetalle;

      await supabase
        .from('mesas')
        .update({ estado: 'ocupada' })
        .eq('id', mesa_id);

      return pedido;
    }

    // Mock Mode
    const newPedido = {
      id: 'ped-' + Date.now(),
      mesa_id,
      estado: 'pendiente',
      total,
      notas: notasCompletas,
      created_at: new Date().toISOString(),
      detalles: items.map(item => ({
        id: 'det-' + Math.random().toString(36).substr(2, 9),
        producto_id: item.producto.id,
        producto: item.producto,
        tamano: item.tamano,
        cantidad: item.cantidad,
        precio_unitario: item.precio_unitario,
        subtotal: item.cantidad * item.precio_unitario
      }))
    };

    mockOrders.unshift(newPedido);
    notifyMockListeners('INSERT', newPedido);
    return newPedido;
  },

  async adicionarAPedidoExistente({ pedidoId, items, montoAdicional, notas }) {
    if (isSupabaseConfigured) {
      const { data: pedidoActual } = await supabase
        .from('pedidos')
        .select('total, notas')
        .eq('id', pedidoId)
        .single();

      const nuevoTotal = Number(pedidoActual.total) + Number(montoAdicional);
      const notasActualizadas = notas ? `${pedidoActual.notas || ''} | Adición: ${notas}` : pedidoActual.notas;

      const detalles = items.map(item => ({
        pedido_id: pedidoId,
        producto_id: item.producto.id,
        tamano: item.tamano,
        cantidad: item.cantidad,
        precio_unitario: item.precio_unitario
      }));

      await supabase.from('detalle_pedido').insert(detalles);

      const { data: pedidoUpd, error } = await supabase
        .from('pedidos')
        .update({
          total: nuevoTotal,
          estado: 'pendiente',
          notas: notasActualizadas,
          updated_at: new Date().toISOString()
        })
        .eq('id', pedidoId)
        .select()
        .single();

      if (error) throw error;
      return pedidoUpd;
    }

    // Mock Mode
    const index = mockOrders.findIndex(o => o.id === pedidoId);
    if (index !== -1) {
      const order = mockOrders[index];
      order.total += montoAdicional;
      order.estado = 'pendiente';
      
      const nuevosDetalles = items.map(item => ({
        id: 'det-' + Math.random().toString(36).substr(2, 9),
        producto_id: item.producto.id,
        producto: item.producto,
        tamano: item.tamano,
        cantidad: item.cantidad,
        precio_unitario: item.precio_unitario,
        subtotal: item.cantidad * item.precio_unitario
      }));

      order.detalles = [...order.detalles, ...nuevosDetalles];
      notifyMockListeners('UPDATE', order);
      return order;
    }
  },

  async getPedidos(filtros = {}) {
    if (isSupabaseConfigured) {
      let query = supabase
        .from('pedidos')
        .select(`
          *,
          mesas (numero_mesa),
          detalle_pedido (
            id,
            tamano,
            cantidad,
            precio_unitario,
            subtotal,
            productos (id, nombre, categoria, ingredientes)
          )
        `)
        .order('created_at', { ascending: false });

      if (filtros.mesa_id) {
        query = query.eq('mesa_id', filtros.mesa_id);
      }
      if (filtros.estado) {
        query = query.eq('estado', filtros.estado);
      }

      const { data, error } = await query;
      if (error) throw error;
      return data;
    }

    let res = [...mockOrders];
    if (filtros.mesa_id) {
      res = res.filter(o => o.mesa_id === filtros.mesa_id);
    }
    if (filtros.estado) {
      res = res.filter(o => o.estado === filtros.estado);
    }
    return res;
  },

  async actualizarEstadoPedido(pedidoId, nuevoEstado, metodoPago = null) {
    if (isSupabaseConfigured) {
      const payload = { 
        estado: nuevoEstado, 
        updated_at: new Date().toISOString() 
      };
      if (metodoPago) {
        payload.metodo_pago = metodoPago;
      }

      const { data, error } = await supabase
        .from('pedidos')
        .update(payload)
        .eq('id', pedidoId)
        .select()
        .single();

      if (error) throw error;

      if (nuevoEstado === 'facturado') {
        const { data: pedidoObj } = await supabase
          .from('pedidos')
          .select('mesa_id')
          .eq('id', pedidoId)
          .single();

        if (pedidoObj) {
          const { data: pendientes } = await supabase
            .from('pedidos')
            .select('id')
            .eq('mesa_id', pedidoObj.mesa_id)
            .neq('estado', 'facturado');

          if (!pendientes || pendientes.length === 0) {
            await supabase
              .from('mesas')
              .update({ estado: 'disponible' })
              .eq('id', pedidoObj.mesa_id);
          }
        }
      }

      return data;
    }

    const index = mockOrders.findIndex(o => o.id === pedidoId);
    if (index !== -1) {
      mockOrders[index].estado = nuevoEstado;
      if (metodoPago) mockOrders[index].metodo_pago = metodoPago;
      notifyMockListeners('UPDATE', mockOrders[index]);
      return mockOrders[index];
    }
    return null;
  },

  subscribeToPedidos(onNewOrder, onUpdateOrder) {
    if (isSupabaseConfigured) {
      const channel = supabase
        .channel('pedidos-realtime-channel')
        .on(
          'postgres_changes',
          { event: 'INSERT', schema: 'public', table: 'pedidos' },
          async (payload) => {
            const { data } = await supabase
              .from('pedidos')
              .select(`
                *,
                mesas (numero_mesa),
                detalle_pedido (
                  id,
                  tamano,
                  cantidad,
                  precio_unitario,
                  subtotal,
                  productos (id, nombre, categoria, ingredientes)
                )
              `)
              .eq('id', payload.new.id)
              .single();

            if (data && onNewOrder) {
              onNewOrder(data);
            }
          }
        )
        .on(
          'postgres_changes',
          { event: 'UPDATE', schema: 'public', table: 'pedidos' },
          (payload) => {
            if (onUpdateOrder) {
              onUpdateOrder(payload.new);
            }
          }
        )
        .subscribe();

      return () => {
        supabase.removeChannel(channel);
      };
    }

    const listener = (eventType, payload) => {
      if (eventType === 'INSERT' && onNewOrder) {
        const mesa = MOCK_MESAS.find(m => m.id === payload.mesa_id);
        const fullPayload = {
          ...payload,
          mesas: { numero_mesa: mesa ? mesa.numero_mesa : '?' }
        };
        onNewOrder(fullPayload);
      }
      if (eventType === 'UPDATE' && onUpdateOrder) {
        onUpdateOrder(payload);
      }
    };

    mockListeners.push(listener);

    return () => {
      mockListeners = mockListeners.filter(l => l !== listener);
    };
  }
};
