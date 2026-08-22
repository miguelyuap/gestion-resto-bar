import React, { useState, useEffect } from 'react';
import { 
  TrendingUp, Calendar, DollarSign, CreditCard, Smartphone, 
  Receipt, ShoppingBag, Award, Printer, RefreshCw, Filter, ArrowUpRight, Search, FileText
} from 'lucide-react';
import { apiService } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { FacturaModal } from './FacturaModal';

export function ReportesVentasView() {
  const { negocio, formatCurrency } = useAuth();
  const [pedidos, setPedidos] = useState([]);
  const [loading, setLoading] = useState(true);

  // Filtros de fecha
  const [rangoSel, setRangoSel] = useState('hoy'); // hoy, ayer, semana, mes, historico, personalizado
  const [fechaInicio, setFechaInicio] = useState('');
  const [fechaFin, setFechaFin] = useState('');
  const [busqueda, setBusqueda] = useState('');

  // Modal para inspeccionar Factura
  const [orderToInspect, setOrderToInspect] = useState(null);

  const loadData = async () => {
    try {
      setLoading(true);
      const data = await apiService.getPedidos({}, negocio?.id);
      setPedidos(data);
    } catch (err) {
      console.error('Error al cargar reportes de ventas:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [negocio]);

  // Lógica de Filtrado por Fecha
  const getFilteredOrders = () => {
    const now = new Date();

    return pedidos.filter(p => {
      // Filtrar solo pedidos facturados o cerrados
      if (p.estado !== 'facturado') return false;

      const pDate = p.created_at ? new Date(p.created_at) : new Date();

      if (rangoSel === 'hoy') {
        return pDate.toDateString() === now.toDateString();
      }

      if (rangoSel === 'ayer') {
        const tempAyer = new Date(now);
        tempAyer.setDate(now.getDate() - 1);
        return pDate.toDateString() === tempAyer.toDateString();
      }

      if (rangoSel === 'semana') {
        const temp7days = new Date(now);
        temp7days.setDate(now.getDate() - 7);
        return pDate >= temp7days;
      }

      if (rangoSel === 'mes') {
        return pDate.getMonth() === now.getMonth() && pDate.getFullYear() === now.getFullYear();
      }

      if (rangoSel === 'personalizado') {
        if (fechaInicio) {
          const start = new Date(`${fechaInicio}T00:00:00`);
          if (pDate < start) return false;
        }
        if (fechaFin) {
          const end = new Date(`${fechaFin}T23:59:59`);
          if (pDate > end) return false;
        }
        return true;
      }

      return true; // historico completo
    });
  };

  const pedidosFacturadosPeriodo = getFilteredOrders();

  // Búsqueda en la lista de facturas
  const facturasFiltradas = pedidosFacturadosPeriodo.filter(p => {
    if (!busqueda) return true;
    const ticketId = p.id || '';
    const numMesa = String(p.mesas?.numero_mesa || p.numero_mesa || '');
    const metodo = p.metodo_pago || '';
    const query = busqueda.toLowerCase();
    return (
      ticketId.toLowerCase().includes(query) ||
      numMesa.includes(query) ||
      metodo.toLowerCase().includes(query)
    );
  });

  // Métricas Financieras Totales
  const totalVentas = pedidosFacturadosPeriodo.reduce((sum, p) => sum + (Number(p.total) || 0), 0);
  const totalFacturas = pedidosFacturadosPeriodo.length;
  const ticketPromedio = totalFacturas > 0 ? totalVentas / totalFacturas : 0;

  // Desglose por Método de Pago
  const ventasEfectivo = pedidosFacturadosPeriodo
    .filter(p => (p.metodo_pago || 'efectivo') === 'efectivo')
    .reduce((sum, p) => sum + (Number(p.total) || 0), 0);

  const ventasNequi = pedidosFacturadosPeriodo
    .filter(p => p.metodo_pago === 'nequi')
    .reduce((sum, p) => sum + (Number(p.total) || 0), 0);

  const ventasDaviplata = pedidosFacturadosPeriodo
    .filter(p => p.metodo_pago === 'daviplata')
    .reduce((sum, p) => sum + (Number(p.total) || 0), 0);

  const ventasTarjeta = pedidosFacturadosPeriodo
    .filter(p => p.metodo_pago === 'tarjeta')
    .reduce((sum, p) => sum + (Number(p.total) || 0), 0);

  // Desglose por Productos / Sabores Top
  const productosStatsMap = {};
  pedidosFacturadosPeriodo.forEach(p => {
    const detalles = p.detalle_pedido || p.detalles || [];
    detalles.forEach(d => {
      const nombre = d.productos?.nombre || d.producto?.nombre || 'Producto';
      const cant = Number(d.cantidad) || 1;
      const pUnit = Number(d.precio_unitario) || 0;
      const subtotal = d.subtotal || (cant * pUnit);

      if (!productosStatsMap[nombre]) {
        productosStatsMap[nombre] = { cantidad: 0, ingresos: 0 };
      }
      productosStatsMap[nombre].cantidad += cant;
      productosStatsMap[nombre].ingresos += subtotal;
    });
  });

  const topProductos = Object.entries(productosStatsMap)
    .map(([nombre, stat]) => ({ nombre, ...stat }))
    .sort((a, b) => b.ingresos - a.ingresos)
    .slice(0, 5);

  const handlePrintReport = () => {
    window.print();
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 pb-24">
      
      {/* HEADER REPORTES DE VENTAS */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 rounded-2xl shadow-sm transition-colors duration-200">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-emerald-500 text-slate-950 flex items-center justify-center font-black text-xl shrink-0 shadow-sm">
            📊
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl sm:text-2xl font-extrabold text-slate-900 dark:text-white">Reportes de Ventas y Facturación</h1>
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              {negocio?.nombre || 'GST Resto Bar'} &bull; Análisis de ingresos por fecha, métodos de pago y comprobantes
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3 no-print">
          <button
            onClick={loadData}
            className="p-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white border border-slate-200 dark:border-slate-700 transition-colors"
            title="Recargar reporte"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          </button>

          <button
            onClick={handlePrintReport}
            className="px-4 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black text-xs flex items-center gap-2 transition-all shadow-md shadow-emerald-500/20 active:scale-95"
          >
            <Printer className="w-4 h-4" />
            <span>Imprimir Reporte</span>
          </button>
        </div>
      </div>

      {/* BARRA DE FILTROS POR FECHA */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 mb-8 shadow-sm no-print space-y-4">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div className="flex items-center gap-2 overflow-x-auto pb-2 md:pb-0 no-scrollbar w-full md:w-auto">
            {[
              { id: 'hoy', label: 'Hoy' },
              { id: 'ayer', label: 'Ayer' },
              { id: 'semana', label: 'Últimos 7 Días' },
              { id: 'mes', label: 'Este Mes' },
              { id: 'historico', label: 'Histórico Completo' },
              { id: 'personalizado', label: '🗓️ Rango Personalizado' }
            ].map(tab => (
              <button
                key={tab.id}
                onClick={() => setRangoSel(tab.id)}
                className={`px-4 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap border shrink-0 ${
                  rangoSel === tab.id
                    ? 'bg-emerald-500 text-slate-950 border-emerald-400 font-black shadow-sm'
                    : 'bg-slate-50 dark:bg-slate-950 text-slate-600 dark:text-slate-400 border-slate-200 dark:border-slate-800 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          <div className="text-xs font-bold text-slate-500 dark:text-slate-400 flex items-center gap-1.5 shrink-0">
            <Calendar className="w-4 h-4 text-emerald-500" />
            <span>{pedidosFacturadosPeriodo.length} facturas en el período</span>
          </div>
        </div>

        {/* Inputs de Rango Personalizado */}
        {rangoSel === 'personalizado' && (
          <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex flex-wrap items-center gap-4 text-xs">
            <div className="flex items-center gap-2">
              <label className="font-bold text-slate-600 dark:text-slate-400">Fecha Inicio:</label>
              <input
                type="date"
                value={fechaInicio}
                onChange={(e) => setFechaInicio(e.target.value)}
                className="bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-3 py-1.5 text-slate-900 dark:text-white font-bold outline-none"
              />
            </div>

            <div className="flex items-center gap-2">
              <label className="font-bold text-slate-600 dark:text-slate-400">Fecha Fin:</label>
              <input
                type="date"
                value={fechaFin}
                onChange={(e) => setFechaFin(e.target.value)}
                className="bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-3 py-1.5 text-slate-900 dark:text-white font-bold outline-none"
              />
            </div>
          </div>
        )}
      </div>

      {/* TARJETAS KPI RESUMEN DE INGRESOS */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
        
        {/* KPI 1: Ventas Totales */}
        <div className="bg-gradient-to-br from-emerald-500/10 via-white dark:via-slate-900 to-teal-500/10 border border-emerald-500/30 p-6 rounded-2xl shadow-sm">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-bold uppercase tracking-wider text-emerald-600 dark:text-emerald-400">
              Ventas Totales
            </span>
            <div className="w-10 h-10 rounded-xl bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 flex items-center justify-center font-bold">
              <TrendingUp className="w-5 h-5" />
            </div>
          </div>
          <h2 className="text-3xl font-black text-slate-900 dark:text-white tracking-tight">
            {formatCurrency(totalVentas)}
          </h2>
          <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1">
            Ingresos acumulados en el período seleccionado
          </p>
        </div>

        {/* KPI 2: Cantidad Facturas */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 rounded-2xl shadow-sm">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
              Facturas Emitidas
            </span>
            <div className="w-10 h-10 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200 flex items-center justify-center font-bold">
              <Receipt className="w-5 h-5" />
            </div>
          </div>
          <h2 className="text-3xl font-black text-slate-900 dark:text-white tracking-tight">
            {totalFacturas} <span className="text-xs font-normal text-slate-400">comprobantes</span>
          </h2>
          <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1">
            Cuentas cerradas y cobradas
          </p>
        </div>

        {/* KPI 3: Ticket Promedio */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 rounded-2xl shadow-sm">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
              Ticket Promedio
            </span>
            <div className="w-10 h-10 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200 flex items-center justify-center font-bold">
              <DollarSign className="w-5 h-5" />
            </div>
          </div>
          <h2 className="text-3xl font-black text-slate-900 dark:text-white tracking-tight">
            {formatCurrency(ticketPromedio)}
          </h2>
          <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1">
            Valor promedio consumido por mesa
          </p>
        </div>

      </div>

      {/* DESGLOSE POR MÉTODOS DE PAGO Y TOP PRODUCTOS */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8 items-start">
        
        {/* MÉTODOS DE PAGO */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-sm space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
            <h3 className="font-extrabold text-base text-slate-900 dark:text-white">Métodos de Pago</h3>
            <span className="text-xs font-bold text-slate-400">Ingresos por Canal</span>
          </div>

          <div className="space-y-3 text-xs">
            <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <DollarSign className="w-4 h-4 text-emerald-500" />
                <span className="font-bold text-slate-800 dark:text-slate-200">Efectivo</span>
              </div>
              <strong className="text-emerald-600 dark:text-emerald-400 font-extrabold text-sm">{formatCurrency(ventasEfectivo)}</strong>
            </div>

            <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <Smartphone className="w-4 h-4 text-purple-500" />
                <span className="font-bold text-slate-800 dark:text-slate-200">Nequi</span>
              </div>
              <strong className="text-slate-900 dark:text-white font-extrabold text-sm">{formatCurrency(ventasNequi)}</strong>
            </div>

            <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <Smartphone className="w-4 h-4 text-rose-500" />
                <span className="font-bold text-slate-800 dark:text-slate-200">Daviplata</span>
              </div>
              <strong className="text-slate-900 dark:text-white font-extrabold text-sm">{formatCurrency(ventasDaviplata)}</strong>
            </div>

            <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <CreditCard className="w-4 h-4 text-blue-500" />
                <span className="font-bold text-slate-800 dark:text-slate-200">Tarjeta</span>
              </div>
              <strong className="text-slate-900 dark:text-white font-extrabold text-sm">{formatCurrency(ventasTarjeta)}</strong>
            </div>
          </div>
        </div>

        {/* TOP PRODUCTOS MÁS VENDIDOS */}
        <div className="lg:col-span-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-sm space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
            <div className="flex items-center gap-2">
              <Award className="w-5 h-5 text-amber-500" />
              <h3 className="font-extrabold text-base text-slate-900 dark:text-white">Productos más Vendidos en el Período</h3>
            </div>
          </div>

          {topProductos.length === 0 ? (
            <p className="text-xs text-slate-400 py-8 text-center">No hay datos de productos en las fechas seleccionadas.</p>
          ) : (
            <div className="space-y-3">
              {topProductos.map((prod, idx) => (
                <div key={idx} className="flex items-center justify-between bg-slate-50 dark:bg-slate-950 p-3.5 rounded-xl border border-slate-200 dark:border-slate-800 text-xs">
                  <div className="flex items-center gap-3">
                    <span className="w-7 h-7 rounded-lg bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center font-black">
                      #{idx + 1}
                    </span>
                    <div>
                      <h4 className="font-extrabold text-slate-900 dark:text-white">{prod.nombre}</h4>
                      <p className="text-[10px] text-slate-400 font-medium">{prod.cantidad} unidades vendidas</p>
                    </div>
                  </div>
                  <span className="font-black text-emerald-600 dark:text-emerald-400 text-sm">
                    {formatCurrency(prod.ingresos)}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>

      </div>

      {/* TABLA DETALLADA DE HISTORIAL DE FACTURAS */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-sm space-y-4">
        
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-3 border-b border-slate-100 dark:border-slate-800">
          <div>
            <h3 className="font-extrabold text-base text-slate-900 dark:text-white">Histórico de Transacciones y Comprobantes</h3>
            <p className="text-xs text-slate-400">Haz clic en cualquier comprobante para ver o reimprimir el ticket</p>
          </div>

          <div className="relative w-full sm:w-64 no-print">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Buscar por ticket, mesa..."
              value={busqueda}
              onChange={(e) => setBusqueda(e.target.value)}
              className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl pl-9 pr-3 py-2 text-xs text-slate-900 dark:text-white outline-none focus:border-emerald-500"
            />
          </div>
        </div>

        {loading ? (
          <div className="py-12 text-center text-slate-500 text-xs flex flex-col items-center gap-2">
            <RefreshCw className="w-6 h-6 animate-spin text-emerald-500" />
            <span>Cargando ventas...</span>
          </div>
        ) : facturasFiltradas.length === 0 ? (
          <div className="py-12 text-center text-slate-400 text-xs">
            No se encontraron comprobantes facturados en el filtro seleccionado.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-slate-200 dark:border-slate-800 text-slate-400 uppercase text-[10px] tracking-wider font-bold">
                  <th className="py-3 px-3">Ticket ID</th>
                  <th className="py-3 px-3">Fecha y Hora</th>
                  <th className="py-3 px-3">Mesa</th>
                  <th className="py-3 px-3">Método Pago</th>
                  <th className="py-3 px-3 text-right">Total ($)</th>
                  <th className="py-3 px-3 text-center no-print">Acción</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60 font-medium">
                {facturasFiltradas.map(p => {
                  const fechaStr = p.created_at
                    ? new Date(p.created_at).toLocaleString([], { dateStyle: 'short', timeStyle: 'short' })
                    : 'N/A';
                  const numMesa = p.mesas?.numero_mesa || p.numero_mesa || '?';

                  return (
                    <tr key={p.id} className="hover:bg-slate-50 dark:hover:bg-slate-950/60 transition-colors">
                      <td className="py-3 px-3 font-mono font-bold text-slate-800 dark:text-slate-200">
                        #{p.id?.slice(0, 8)}
                      </td>
                      <td className="py-3 px-3 text-slate-500 dark:text-slate-400">
                        {fechaStr}
                      </td>
                      <td className="py-3 px-3 font-bold text-slate-800 dark:text-slate-200">
                        Mesa #{numMesa}
                      </td>
                      <td className="py-3 px-3">
                        <span className="px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 font-bold uppercase text-[10px] border border-emerald-500/20">
                          {p.metodo_pago || 'Efectivo'}
                        </span>
                      </td>
                      <td className="py-3 px-3 text-right font-black text-slate-900 dark:text-slate-100 text-sm">
                        {formatCurrency(p.total)}
                      </td>
                      <td className="py-3 px-3 text-center no-print">
                        <button
                          onClick={() => setOrderToInspect(p)}
                          className="px-3 py-1.5 rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 font-bold text-xs inline-flex items-center gap-1.5 transition-colors border border-slate-200 dark:border-slate-700"
                        >
                          <FileText className="w-3.5 h-3.5 text-emerald-500" />
                          <span>Ver Factura</span>
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}

      </div>

      {/* MODAL PARA REIMPRIMIR O CONSULTAR FACTURA SELECCIONADA */}
      {orderToInspect && (
        <FacturaModal
          pedido={orderToInspect}
          readOnly={true}
          onClose={() => setOrderToInspect(null)}
        />
      )}

    </div>
  );
}
