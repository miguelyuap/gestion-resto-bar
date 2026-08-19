import { supabase, isSupabaseConfigured } from '../lib/supabase';

// MENÚ COMPLETO Y EXACTO DE "GRANIZADOS & FLOW - A LO MÁS AGOGO"
const MOCK_PRODUCTS = [
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

  // --- GRANIZADOS SIN LICOR ---
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

  // --- GRANIZADOS CREMOSOS ---
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

const isUuidFormat = (str) => {
  return typeof str === 'string' && /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(str);
};

export const apiService = {
  // 1. OBTENER PRODUCTOS
  async getProductos() {
    if (isSupabaseConfigured) {
      try {
        const { data, error } = await supabase
          .from('productos')
          .select('*')
          .eq('activo', true)
          .order('categoria', { ascending: true });
        
        if (!error && data && data.length > 0) {
          return data;
        }
      } catch (err) {
        console.warn('Usando productos locales:', err);
      }
    }
    return MOCK_PRODUCTS;
  },

  // Helper interno infalible para obtener siempre un UUID de PostgreSQL válido para un producto
  async getValidProductoUuid(productoObj) {
    if (!productoObj) return null;

    if (isUuidFormat(productoObj.id)) {
      return productoObj.id;
    }

    if (isSupabaseConfigured && supabase) {
      try {
        // 1. Buscar producto por nombre en Supabase DB
        const { data: matched } = await supabase
          .from('productos')
          .select('id')
          .ilike('nombre', productoObj.nombre.trim())
          .limit(1)
          .maybeSingle();

        if (matched && isUuidFormat(matched.id)) {
          return matched.id;
        }

        // 2. Si no existe por nombre, crearlo automáticamente en Supabase para obtener su UUID
        const { data: newProd, error: errCreate } = await supabase
          .from('productos')
          .insert([
            {
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

        // 3. Fallback de respaldo: obtener el primer producto activo existente
        const { data: firstProd } = await supabase
          .from('productos')
          .select('id')
          .eq('activo', true)
          .limit(1)
          .maybeSingle();

        if (firstProd && isUuidFormat(firstProd.id)) {
          return firstProd.id;
        }
      } catch (err) {
        console.warn('Error resolviendo o creando UUID de producto en Supabase:', err);
      }
    }

    return null;
  },

  // 2. OBTENER MESAS
  async getMesas() {
    if (isSupabaseConfigured) {
      try {
        const { data: mesasData, error: errMesas } = await supabase
          .from('mesas')
          .select('*')
          .order('numero_mesa', { ascending: true });

        if (!errMesas && mesasData && mesasData.length > 0) {
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

  // 3. CREAR PEDIDO NUEVO EN SUPABASE CON INSERCIÓN GARANTIZADA DE DETALLES
  async crearPedido({ mesa_id, selectedMesaNum, items, total, notas, meseroNombre }) {
    const notasCompletas = meseroNombre 
      ? `[Mesero: ${meseroNombre}] ${notas || ''}`.trim()
      : (notas || '');

    if (isSupabaseConfigured && supabase) {
      try {
        let targetMesaId = mesa_id;

        // 1. Resolver o crear UUID válido para la mesa
        if (!isUuidFormat(targetMesaId)) {
          const mesaNum = parseInt(selectedMesaNum || 1, 10);
          const { data: mesaDb, error: errMesa } = await supabase
            .from('mesas')
            .select('id')
            .eq('numero_mesa', mesaNum)
            .maybeSingle();

          if (errMesa) {
            console.error('❌ [Supabase] Error buscando mesa:', errMesa);
          }

          if (mesaDb && isUuidFormat(mesaDb.id)) {
            targetMesaId = mesaDb.id;
          } else {
            const { data: newMesa, error: errNewMesa } = await supabase
              .from('mesas')
              .insert([{ numero_mesa: mesaNum, estado: 'ocupada' }])
              .select('id')
              .single();

            if (errNewMesa) {
              console.error('❌ [Supabase Error] Falló creación de mesa:', errNewMesa);
              throw new Error(`Error vinculando Mesa #${mesaNum}: ${errNewMesa.message}`);
            }
            targetMesaId = newMesa.id;
          }
        }

        // 2. Insertar encabezado del pedido en Supabase
        const { data: pedido, error: errPedido } = await supabase
          .from('pedidos')
          .insert([
            {
              mesa_id: targetMesaId,
              total: Number(total),
              estado: 'pendiente',
              notas: notasCompletas
            }
          ])
          .select()
          .single();

        if (errPedido) {
          console.error('❌ [Supabase Error] Error al insertar pedido:', {
            code: errPedido.code,
            message: errPedido.message,
            details: errPedido.details,
            hint: errPedido.hint
          });
          alert(`⚠️ Error de Supabase al guardar pedido: ${errPedido.message} (Código: ${errPedido.code})`);
          throw errPedido;
        }

        if (pedido) {
          // 3. Construir array de detalles resolviendo UUIDs reales de PostgreSQL
          const detalles = [];
          for (const item of items) {
            const realProdId = await this.getValidProductoUuid(item.producto);

            if (!realProdId) {
              console.error('⚠️ [Supabase] No se pudo resolver producto_id UUID para:', item.producto?.nombre);
              continue;
            }

            // Normalizar tamano para respetar restriccion CHECK (tamano IN ('8oz', '12oz', '24oz', '100oz'))
            let cleanTamano = String(item.tamano || '12oz').trim();
            if (!['8oz', '12oz', '24oz', '100oz'].includes(cleanTamano)) {
              if (cleanTamano.includes('8')) cleanTamano = '8oz';
              else if (cleanTamano.includes('12')) cleanTamano = '12oz';
              else if (cleanTamano.includes('24')) cleanTamano = '24oz';
              else cleanTamano = '100oz';
            }

            detalles.push({
              pedido_id: pedido.id,
              producto_id: realProdId,
              tamano: cleanTamano,
              cantidad: Math.max(1, parseInt(item.cantidad, 10)),
              precio_unitario: Number(item.precio_unitario)
            });
          }

          // 4. Insertar detalles vinculados al pedido_id
          if (detalles.length > 0) {
            const { error: errDetalle } = await supabase.from('detalle_pedido').insert(detalles);
            if (errDetalle) {
              console.error('❌ [Supabase Error] Error en tabla detalle_pedido:', {
                code: errDetalle.code,
                message: errDetalle.message,
                details: errDetalle.details,
                hint: errDetalle.hint
              });
              alert(`⚠️ Error al guardar detalle_pedido en Supabase: ${errDetalle.message} (Código: ${errDetalle.code})`);
              throw errDetalle;
            }
          }

          // 5. Actualizar estado de la mesa a 'ocupada'
          await supabase.from('mesas').update({ estado: 'ocupada' }).eq('id', targetMesaId);

          return pedido;
        }
      } catch (err) {
        console.error('❌ Excepción al crear pedido en Supabase:', err);
        throw err;
      }
    }

    // Fallback local únicamente cuando Supabase NO está configurado
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

  // 4. ADICIONAR A PEDIDO EXISTENTE EN SUPABASE
  async adicionarAPedidoExistente({ pedidoId, items, montoAdicional, notas }) {
    if (isSupabaseConfigured && supabase) {
      try {
        if (isUuidFormat(pedidoId)) {
          const { data: pedidoActual, error: errFetch } = await supabase
            .from('pedidos')
            .select('total, notas')
            .eq('id', pedidoId)
            .single();

          if (errFetch) {
            console.error('❌ [Supabase Error] Error al consultar pedido para adición:', errFetch);
            throw errFetch;
          }

          if (pedidoActual) {
            const nuevoTotal = Number(pedidoActual.total) + Number(montoAdicional);
            const notasActualizadas = notas ? `${pedidoActual.notas || ''} | Adición: ${notas}` : pedidoActual.notas;

            const detalles = [];
            for (const item of items) {
              const realProdId = await this.getValidProductoUuid(item.producto);
              if (!realProdId) {
                console.error('⚠️ [Supabase] No se pudo resolver producto_id UUID para adición:', item.producto?.nombre);
                continue;
              }

              let cleanTamano = String(item.tamano || '12oz').trim();
              if (!['8oz', '12oz', '24oz', '100oz'].includes(cleanTamano)) {
                if (cleanTamano.includes('8')) cleanTamano = '8oz';
                else if (cleanTamano.includes('12')) cleanTamano = '12oz';
                else if (cleanTamano.includes('24')) cleanTamano = '24oz';
                else cleanTamano = '100oz';
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
              const { error: errDetalle } = await supabase.from('detalle_pedido').insert(detalles);
              if (errDetalle) {
                console.error('❌ [Supabase Error] Error insertando adición en detalle_pedido:', {
                  code: errDetalle.code,
                  message: errDetalle.message,
                  details: errDetalle.details
                });
                alert(`⚠️ Error al guardar adición en Supabase: ${errDetalle.message}`);
                throw errDetalle;
              }
            }

            const { data: pedidoUpd, error: errUpd } = await supabase
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

            if (errUpd) {
              console.error('❌ [Supabase Error] Error actualizando total del pedido:', errUpd);
              throw errUpd;
            }

            if (pedidoUpd) return pedidoUpd;
          }
        }
      } catch (err) {
        console.error('❌ Excepción adicionando a pedido en Supabase:', err);
        throw err;
      }
    }

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

  // 5. OBTENER PEDIDOS DE SUPABASE
  async getPedidos(filtros = {}) {
    if (isSupabaseConfigured) {
      try {
        let query = supabase
          .from('pedidos')
          .select('*, mesas(numero_mesa), detalle_pedido(*, productos(*))')
          .order('created_at', { ascending: false });

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

        // Consulta de respaldo limpia por ID
        const { data: basePedidos } = await supabase
          .from('pedidos')
          .select('*, mesas(numero_mesa)')
          .order('created_at', { ascending: false });

        if (basePedidos && basePedidos.length > 0) {
          const ids = basePedidos.map(p => p.id);
          const { data: todosDetalles } = await supabase
            .from('detalle_pedido')
            .select('*, productos(*)')
            .in('pedido_id', ids);

          return basePedidos.map(p => ({
            ...p,
            detalle_pedido: todosDetalles ? todosDetalles.filter(d => d.pedido_id === p.id) : []
          }));
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

  // 6. ACTUALIZAR ESTADO DE UN PEDIDO EN SUPABASE
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

        if (error) {
          console.error('❌ Error de Supabase al actualizar estado del pedido:', error);
          alert(`⚠️ Error de Supabase al cambiar estado: ${error.message} (${error.code})`);
        } else if (data) {
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

  // 7. SUSCRIPCION REALTIME DE WEBSOCKETS
  subscribeToPedidos(onNewOrder, onUpdateOrder) {
    if (isSupabaseConfigured) {
      try {
        const channel = supabase
          .channel('pedidos-realtime-channel')
          .on(
            'postgres_changes',
            { event: 'INSERT', schema: 'public', table: 'pedidos' },
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
            { event: 'UPDATE', schema: 'public', table: 'pedidos' },
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
