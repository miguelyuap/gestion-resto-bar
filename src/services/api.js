import { supabase, isSupabaseConfigured } from '../lib/supabase';

const DEFAULT_TENANT_ID = '00000000-0000-0000-0000-000000000001';

// MENÚ COMPLETO Y EXACTO DE "GST RESTO BAR"
const MOCK_PRODUCTS = [
  {
    id: 'prod-1',
    negocio_id: DEFAULT_TENANT_ID,
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
    negocio_id: DEFAULT_TENANT_ID,
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
    negocio_id: DEFAULT_TENANT_ID,
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
    negocio_id: DEFAULT_TENANT_ID,
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
    negocio_id: DEFAULT_TENANT_ID,
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
    negocio_id: DEFAULT_TENANT_ID,
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
    negocio_id: DEFAULT_TENANT_ID,
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
    id: 'prod-8',
    negocio_id: DEFAULT_TENANT_ID,
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
    id: 'prod-9',
    negocio_id: DEFAULT_TENANT_ID,
    nombre: 'BAILEYS CREMOSO',
    categoria: 'cremoso',
    ingredientes: 'Crema de café - Whisky',
    precio_8oz: 14000,
    precio_12oz: 18000,
    precio_24oz: 25000,
    precio_100oz: 65000,
    activo: true,
    imagen_url: 'https://images.unsplash.com/photo-1572490122747-3968b75cc699?auto=format&fit=crop&w=400&q=80'
  }
];

const MOCK_MESAS = Array.from({ length: 10 }, (_, i) => ({
  id: `mesa-${i + 1}`,
  negocio_id: DEFAULT_TENANT_ID,
  numero_mesa: i + 1,
  estado: 'disponible',
  qr_code_url: `https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=${encodeURIComponent(`http://localhost:5173/?mesa=${i + 1}`)}`
}));

let mockOrders = [];
let mockListeners = [];

const notifyMockListeners = (eventType, payload) => {
  mockListeners.forEach(listener => listener(eventType, payload));
};

const isUuidFormat = (str) => {
  if (typeof str !== 'string') return false;
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
  return uuidRegex.test(str);
};

export const apiService = {
  // 1. OBTENER PRODUCTOS (MULTI-TENANT)
  async getProductos(negocioId = null) {
    const targetNegocioId = negocioId || DEFAULT_TENANT_ID;

    if (isSupabaseConfigured) {
      try {
        let query = supabase
          .from('productos')
          .select('*')
          .eq('activo', true)
          .order('categoria', { ascending: true });

        if (targetNegocioId) {
          query = query.eq('negocio_id', targetNegocioId);
        }

        const { data, error } = await query;

        if (!error && data && data.length > 0) {
          return data;
        }
      } catch (err) {
        console.warn('Usando productos locales por error en Supabase:', err);
      }
    }
    return MOCK_PRODUCTS;
  },

  // Helper para validar o crear UUID de producto en el tenant
  async getValidProductoUuid(productoObj, negocioId = DEFAULT_TENANT_ID) {
    if (!productoObj) return null;

    if (isUuidFormat(productoObj.id)) {
      return productoObj.id;
    }

    if (isSupabaseConfigured && supabase) {
      try {
        const { data: matched } = await supabase
          .from('productos')
          .select('id')
          .eq('negocio_id', negocioId)
          .ilike('nombre', productoObj.nombre.trim())
          .limit(1)
          .maybeSingle();

        if (matched && isUuidFormat(matched.id)) {
          return matched.id;
        }

        const { data: newProd, error: errCreate } = await supabase
          .from('productos')
          .insert([
            {
              negocio_id: negocioId,
              nombre: productoObj.nombre,
              categoria: productoObj.categoria || 'con_licor',
              ingredientes: productoObj.ingredientes || '',
              precio_8oz: productoObj.precio_8oz || 12000,
              precio_12oz: productoObj.precio_12oz || 16000,
              precio_24oz: productoObj.precio_24oz || 24000,
              precio_100oz: productoObj.precio_100oz || 70000,
              activo: true,
              imagen_url: productoObj.imagen_url || ''
            }
          ])
          .select('id')
          .single();

        if (!errCreate && newProd && isUuidFormat(newProd.id)) {
          return newProd.id;
        }

        const { data: firstProd } = await supabase
          .from('productos')
          .select('id')
          .eq('negocio_id', negocioId)
          .eq('activo', true)
          .limit(1)
          .maybeSingle();

        if (firstProd && isUuidFormat(firstProd.id)) {
          return firstProd.id;
        }
      } catch (err) {
        console.warn('Error resolviendo UUID de producto en Supabase:', err);
      }
    }

    return null;
  },

  // 2. OBTENER MESAS (MULTI-TENANT)
  async getMesas(negocioId = null) {
    const targetNegocioId = negocioId || DEFAULT_TENANT_ID;

    if (isSupabaseConfigured) {
      try {
        let queryMesas = supabase
          .from('mesas')
          .select('*')
          .order('numero_mesa', { ascending: true });

        if (targetNegocioId) {
          queryMesas = queryMesas.eq('negocio_id', targetNegocioId);
        }

        const { data: mesasData, error: errMesas } = await queryMesas;

        if (!errMesas && mesasData && mesasData.length > 0) {
          let queryPedidos = supabase
            .from('pedidos')
            .select('*, detalle_pedido(*)')
            .neq('estado', 'facturado');

          if (targetNegocioId) {
            queryPedidos = queryPedidos.eq('negocio_id', targetNegocioId);
          }

          const { data: pedidosActivos } = await queryPedidos;

          return mesasData.map(m => {
            const pActivo = pedidosActivos?.find(p => p.mesa_id === m.id);
            return {
              ...m,
              estado: pActivo ? 'ocupada' : 'disponible',
              pedidoActivo: pActivo || null
            };
          });
        }
      } catch (err) {
        console.warn('Usando mesas locales:', err);
      }
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

  // 3. CREAR PEDIDO NUEVO (MULTI-TENANT)
  async crearPedido({ negocio_id = DEFAULT_TENANT_ID, mesa_id, selectedMesaNum, items, total, notas, meseroNombre }) {
    const targetNegocioId = negocio_id || DEFAULT_TENANT_ID;
    const notasCompletas = meseroNombre 
      ? `[Mesero: ${meseroNombre}] ${notas || ''}`.trim()
      : (notas || '');

    if (isSupabaseConfigured && supabase) {
      try {
        let targetMesaId = mesa_id;

        if (!isUuidFormat(targetMesaId)) {
          const mesaNum = parseInt(selectedMesaNum || 1, 10);
          const { data: mesaDb } = await supabase
            .from('mesas')
            .select('id')
            .eq('negocio_id', targetNegocioId)
            .eq('numero_mesa', mesaNum)
            .maybeSingle();

          if (mesaDb && isUuidFormat(mesaDb.id)) {
            targetMesaId = mesaDb.id;
          } else {
            const { data: newMesa, error: errNewMesa } = await supabase
              .from('mesas')
              .insert([{ negocio_id: targetNegocioId, numero_mesa: mesaNum, estado: 'ocupada' }])
              .select('id')
              .single();

            if (errNewMesa) {
              console.error('❌ Error creando mesa para tenant:', errNewMesa);
              throw new Error(`Error vinculando Mesa #${mesaNum}: ${errNewMesa.message}`);
            }
            targetMesaId = newMesa.id;
          }
        }

        const { data: pedido, error: errPedido } = await supabase
          .from('pedidos')
          .insert([
            {
              negocio_id: targetNegocioId,
              mesa_id: targetMesaId,
              total: Number(total),
              estado: 'pendiente',
              notas: notasCompletas
            }
          ])
          .select()
          .single();

        if (errPedido) {
          console.error('❌ Error al guardar pedido:', errPedido);
          alert(`⚠️ Error de Supabase al guardar pedido: ${errPedido.message}`);
          throw errPedido;
        }

        if (pedido) {
          const detalles = [];
          for (const item of items) {
            const realProdId = await this.getValidProductoUuid(item.producto, targetNegocioId);
            if (!realProdId) continue;

            let cleanTamano = String(item.tamano || '12oz').trim();
            if (!['8oz', '12oz', '24oz', '100oz', 'unidad'].includes(cleanTamano)) {
              cleanTamano = '12oz';
            }

            detalles.push({
              pedido_id: pedido.id,
              producto_id: realProdId,
              tamano: cleanTamano,
              cantidad: Math.max(1, parseInt(item.cantidad, 10)),
              precio_unitario: Number(item.precio_unitario)
            });
          }

          if (detalles.length > 0) {
            const { error: errDetalle } = await supabase.from('detalle_pedido').insert(detalles);
            if (errDetalle) {
              console.error('❌ Error en detalle_pedido:', errDetalle);
              throw errDetalle;
            }
          }

          await supabase.from('mesas').update({ estado: 'ocupada' }).eq('id', targetMesaId);
          return pedido;
        }
      } catch (err) {
        console.error('❌ Excepción al crear pedido:', err);
        throw err;
      }
    }

    const newPedido = {
      id: 'ped-' + Date.now(),
      negocio_id: targetNegocioId,
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

  // 4. ADICIONAR A PEDIDO EXISTENTE
  async adicionarAPedidoExistente({ pedidoId, items, montoAdicional, notas, negocioId = DEFAULT_TENANT_ID }) {
    if (isSupabaseConfigured && supabase && isUuidFormat(pedidoId)) {
      try {
        const { data: pedidoActual, error: errFetch } = await supabase
          .from('pedidos')
          .select('total, notas')
          .eq('id', pedidoId)
          .single();

        if (pedidoActual) {
          const nuevoTotal = Number(pedidoActual.total) + Number(montoAdicional);
          const notasActualizadas = notas ? `${pedidoActual.notas || ''} | Adición: ${notas}` : pedidoActual.notas;

          const detalles = [];
          for (const item of items) {
            const realProdId = await this.getValidProductoUuid(item.producto, negocioId);
            if (!realProdId) continue;

            let cleanTamano = String(item.tamano || '12oz').trim();
            if (!['8oz', '12oz', '24oz', '100oz', 'unidad'].includes(cleanTamano)) {
              cleanTamano = '12oz';
            }

            detalles.push({
              pedido_id: pedidoId,
              producto_id: realProdId,
              tamano: cleanTamano,
              cantidad: Math.max(1, parseInt(item.cantidad, 10)),
              precio_unitario: Number(item.precio_unitario)
            });
          }

          if (detalles.length > 0) {
            await supabase.from('detalle_pedido').insert(detalles);
          }

          const { data: pedidoUpd } = await supabase
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

          if (pedidoUpd) return pedidoUpd;
        }
      } catch (err) {
        console.error('❌ Excepción adicionando a pedido:', err);
      }
    }

    const index = mockOrders.findIndex(o => o.id === pedidoId);
    if (index !== -1) {
      const order = mockOrders[index];
      order.total += montoAdicional;
      order.estado = 'pendiente';
      notifyMockListeners('UPDATE', order);
      return order;
    }
  },

  // 5. OBTENER PEDIDOS (MULTI-TENANT)
  async getPedidos(filtros = {}, negocioId = null) {
    const targetNegocioId = negocioId || DEFAULT_TENANT_ID;

    if (isSupabaseConfigured) {
      try {
        let query = supabase
          .from('pedidos')
          .select('*, mesas(numero_mesa), detalle_pedido(*, productos(*))')
          .order('created_at', { ascending: false });

        if (targetNegocioId) {
          query = query.eq('negocio_id', targetNegocioId);
        }
        if (filtros.mesa_id && isUuidFormat(filtros.mesa_id)) {
          query = query.eq('mesa_id', filtros.mesa_id);
        }
        if (filtros.estado) {
          query = query.eq('estado', filtros.estado);
        }

        const { data, error } = await query;
        if (!error && data) {
          return data;
        }
      } catch (err) {
        console.error('Error obteniendo pedidos de Supabase:', err);
      }
    }

    let res = [...mockOrders];
    if (filtros.mesa_id) res = res.filter(o => o.mesa_id === filtros.mesa_id);
    if (filtros.estado) res = res.filter(o => o.estado === filtros.estado);
    return res;
  },

  // 6. ACTUALIZAR ESTADO DE UN PEDIDO
  async actualizarEstadoPedido(pedidoId, nuevoEstado, metodoPago = null) {
    if (isSupabaseConfigured && isUuidFormat(pedidoId)) {
      try {
        const payload = { 
          estado: nuevoEstado, 
          updated_at: new Date().toISOString() 
        };
        if (metodoPago) payload.metodo_pago = metodoPago;

        const { data, error } = await supabase
          .from('pedidos')
          .update(payload)
          .eq('id', pedidoId)
          .select()
          .single();

        if (!error && data) {
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
                await supabase.from('mesas').update({ estado: 'disponible' }).eq('id', pedidoObj.mesa_id);
              }
            }
          }
          return data;
        }
      } catch (err) {
        console.error('Error actualizando pedido en Supabase:', err);
      }
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

  // 7. SUSCRIPCION REALTIME DE WEBSOCKETS (MULTI-TENANT)
  subscribeToPedidos(onNewOrder, onUpdateOrder, negocioId = null) {
    const targetNegocioId = negocioId || DEFAULT_TENANT_ID;

    if (isSupabaseConfigured) {
      try {
        const channel = supabase
          .channel(`pedidos-realtime-${targetNegocioId}`)
          .on(
            'postgres_changes',
            { 
              event: 'INSERT', 
              schema: 'public', 
              table: 'pedidos',
              filter: `negocio_id=eq.${targetNegocioId}`
            },
            async (payload) => {
              const { data } = await supabase
                .from('pedidos')
                .select('*, mesas(numero_mesa), detalle_pedido(*, productos(*))')
                .eq('id', payload.new.id)
                .single();

              if (data && onNewOrder) onNewOrder(data);
            }
          )
          .on(
            'postgres_changes',
            { 
              event: 'UPDATE', 
              schema: 'public', 
              table: 'pedidos',
              filter: `negocio_id=eq.${targetNegocioId}`
            },
            (payload) => {
              if (onUpdateOrder) onUpdateOrder(payload.new);
            }
          )
          .subscribe();

        return () => {
          supabase.removeChannel(channel);
        };
      } catch (err) {
        console.warn('Error suscribiendo a Supabase Realtime:', err);
      }
    }

    const listener = (eventType, payload) => {
      if (eventType === 'INSERT' && onNewOrder) {
        const mesa = MOCK_MESAS.find(m => m.id === payload.mesa_id);
        onNewOrder({
          ...payload,
          mesas: { numero_mesa: mesa ? mesa.numero_mesa : '?' }
        });
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
