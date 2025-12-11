import React, { useMemo } from 'react';
import { FaMoneyBillWave, FaClock, FaChartPie } from 'react-icons/fa';

export const DashboardResumenCard = ({ boletos, precioBoleto, fechaSorteo }) => {

    // --- 1. Cálculos de Estadísticas ---
    const stats = useMemo(() => {
        const total = boletos.length;
        const pagados = boletos.filter(b => b.estado === 'pagado').length;
        const apartados = boletos.filter(b => b.estado === 'apartado').length;
        const disponibles = boletos.filter(b => b.estado === 'disponible').length;

        const recaudado = pagados * precioBoleto;
        const porRecaudar = apartados * precioBoleto;

        // Porcentaje de ventas
        const porcentajeProgreso = total > 0 ? Math.round(((pagados + apartados) / total) * 100) : 0;

        return { total, pagados, apartados, disponibles, recaudado, porRecaudar, porcentajeProgreso };
    }, [boletos, precioBoleto]);

    // --- 2. Cálculo de Días Restantes ---
    const diasRestantes = useMemo(() => {
        if (!fechaSorteo) return 0;
        const hoy = new Date();
        const fechaFin = new Date(fechaSorteo);
        const diferencia = fechaFin - hoy;
        const dias = Math.ceil(diferencia / (1000 * 60 * 60 * 24));
        return dias > 0 ? dias : 0;
    }, [fechaSorteo]);

    const fmtMoney = (amount) => new Intl.NumberFormat('es-MX', { style: 'currency', currency: 'MXN' }).format(amount);

    return (
        <div className="bg-white border border-gray-200 rounded-2xl shadow-sm p-6 mb-8 mt-8">
            {/* Header del Card */}
            <div className="flex justify-between items-center mb-6 border-b border-gray-100 pb-4">

                <div className="text-sm text-gray-500 flex items-center gap-2 bg-gray-50 px-3 py-1 rounded-lg">
                    <span>Cierre del sorteo en:</span>
                    <span className={`font-bold ${diasRestantes < 5 ? 'text-red-600' : 'text-gray-700'}`}>
                        {diasRestantes} días
                    </span>
                </div>
            </div>

            {/* Grid Principal */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">

                {/* CARD 1: RECAUDADO (Verde) */}
                <div className="bg-green-50 rounded-xl p-4 border border-green-100 flex flex-col justify-between hover:shadow-md transition-shadow">
                    <div className="flex justify-between items-start mb-2">
                        <span className="text-green-800 font-medium font-afacad">Recaudado</span>
                        <div className="p-2  rounded-full text-green-600 ">
                            <FaMoneyBillWave />
                        </div>
                    </div>
                    <div>
                        <span className="text-3xl font-bold text-green-700 font-afacad">{fmtMoney(stats.recaudado)}</span>
                        <p className="text-xs text-green-600 mt-1 font-medium">Dinero en caja (Pagados)</p>
                    </div>
                </div>

                {/* CARD 2: POR RECAUDAR (Amarillo) */}
                <div className="bg-amber-50 rounded-xl p-4 border border-amber-100 flex flex-col justify-between hover:shadow-md transition-shadow">
                    <div className="flex justify-between items-start mb-2">
                        <span className="text-amber-800 font-medium font-afacad">Por Recaudar</span>
                        <div className="p-2rounded-full text-amber-500 ">
                            <FaClock />
                        </div>
                    </div>
                    <div>
                        <span className="text-3xl font-bold text-amber-700 font-afacad">{fmtMoney(stats.porRecaudar)}</span>
                        <p className="text-xs text-amber-600 mt-1 font-medium">En boletos apartados</p>
                    </div>
                </div>

                {/* CARD 3: ESTADO BOLETOS (Azul - Ocupa 2 columnas) */}
                <div className="bg-blue-50 rounded-xl p-4 border border-blue-100 col-span-1 lg:col-span-2 flex flex-col justify-center">
                    <div className="grid grid-cols-3 gap-4 text-center h-full items-center">
                        <div className="flex flex-col">
                            <span className="text-2xl font-bold text-blue-600">{stats.pagados}</span>
                            <span className="text-xs font-bold uppercase tracking-wider text-blue-800/70">Vendidos</span>
                        </div>
                        <div className="flex flex-col border-l border-r border-blue-200/60">
                            <span className="text-2xl font-bold text-yellow-600">{stats.apartados}</span>
                            <span className="text-xs font-bold uppercase tracking-wider text-yellow-800/70">Apartados</span>
                        </div>
                        <div className="flex flex-col">
                            <span className="text-2xl font-bold text-gray-500">{stats.disponibles}</span>
                            <span className="text-xs font-bold uppercase tracking-wider text-gray-600/70">Libres</span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};