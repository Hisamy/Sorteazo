import React, { useState } from 'react';
import {
    FaTimes,
    FaFileInvoiceDollar,
    FaChartPie,
    FaHistory,
    FaDownload,
    FaSpinner
} from 'react-icons/fa';

export const GenerarReporteModal = ({ isOpen, onClose, onGenerarReporte }) => {
    const [loading, setLoading] = useState(false);
    const [reportType, setReportType] = useState(null);

    if (!isOpen) {
        return null;
    }

    // Manejador para ejecutar la acción de generar
    const handleGenerate = async (type) => {
        setReportType(type);
        setLoading(true);
        try {
            // Se asume que onGenerarReporte es una función que recibe el tipo y devuelve una promesa
            // Tipos: 'DEUDORES', 'ESTADO', 'HISTORICO'
            if (onGenerarReporte) {
                await onGenerarReporte(type);
            }
        } catch (error) {
            console.error("Error generando el reporte:", error);
        } finally {
            setLoading(false);
            setReportType(null);
        }
    };

    return (
        <div className="fixed inset-0 bg-black/50 z-[60] flex justify-center items-center p-4 overflow-y-auto">
            {/* Se mantiene el estilo del contenedor del modal original */}
            <div className="bg-white rounded-lg shadow-xl p-6 w-full max-w-lg relative font-afacad my-8 max-h-[90vh] overflow-y-auto">

                {/* Botón de cerrar */}
                <button
                    onClick={onClose}
                    disabled={loading}
                    className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 disabled:opacity-50"
                >
                    <FaTimes size={20} />
                </button>

                {/* Título */}
                <h2 className="text-3xl font-bold text-gray-800 mb-2 text-center">
                    Generar Reportes
                </h2>
                <p className="text-center text-gray-500 mb-8 text-sm">
                    Selecciona el tipo de reporte que deseas exportar
                </p>

                <div className="space-y-4">

                    {/* Opción 1: Reporte de Deudores */}
                    <div className="group border border-gray-200 rounded-lg p-4 hover:border-red-300 hover:shadow-md transition-all">
                        <div className="flex justify-between items-start">
                            <div className="flex items-start gap-4">
                                <div className="p-3 bg-red-50 text-red-600 rounded-full">
                                    <FaFileInvoiceDollar size={20} />
                                </div>
                                <div>
                                    <h3 className="font-bold text-lg text-gray-800 group-hover:text-red-700 transition-colors">
                                        Reporte de Deudores
                                    </h3>
                                    <p className="text-sm text-gray-500 mt-1">
                                        Incluye números apartados y monto total de la deuda pendiente.
                                    </p>
                                </div>
                            </div>
                            <button
                                onClick={() => handleGenerate('DEUDORES')}
                                disabled={loading}
                                className="bg-red-600 hover:bg-red-700 disabled:bg-gray-400 text-white p-3 rounded-lg shadow transition-colors"
                            >
                                {loading && reportType === 'DEUDORES' ? <FaSpinner className="animate-spin" /> : <FaDownload />}
                            </button>
                        </div>
                    </div>

                    {/* Opción 2: Reporte de Estado de Boletos */}
                    <div className="group border border-gray-200 rounded-lg p-4 hover:border-blue-300 hover:shadow-md transition-all">
                        <div className="flex justify-between items-start">
                            <div className="flex items-start gap-4">
                                <div className="p-3 bg-blue-50 text-blue-600 rounded-full">
                                    <FaChartPie size={20} />
                                </div>
                                <div>
                                    <h3 className="font-bold text-lg text-gray-800 group-hover:text-blue-700 transition-colors">
                                        Estado de Boletos
                                    </h3>
                                    <p className="text-sm text-gray-500 mt-1">
                                        Desglose de números apartados, vendidos y libres actuales.
                                    </p>
                                </div>
                            </div>
                            <button
                                onClick={() => handleGenerate('ESTADO')}
                                disabled={loading}
                                className="bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white p-3 rounded-lg shadow transition-colors"
                            >
                                {loading && reportType === 'ESTADO' ? <FaSpinner className="animate-spin" /> : <FaDownload />}
                            </button>
                        </div>
                    </div>

                    {/* Opción 3: Reporte Histórico */}
                    <div className="group border border-gray-200 rounded-lg p-4 hover:border-purple-300 hover:shadow-md transition-all">
                        <div className="flex justify-between items-start">
                            <div className="flex items-start gap-4">
                                <div className="p-3 bg-purple-50 text-purple-600 rounded-full">
                                    <FaHistory size={20} />
                                </div>
                                <div>
                                    <h3 className="font-bold text-lg text-gray-800 group-hover:text-purple-700 transition-colors">
                                        Histórico de Sorteos
                                    </h3>
                                    <p className="text-sm text-gray-500 mt-1">
                                        Detalles completos: fechas, recaudación, montos pendientes y cantidades por estado.
                                    </p>
                                </div>
                            </div>
                            <button
                                onClick={() => handleGenerate('HISTORICO')}
                                disabled={loading}
                                className="bg-purple-600 hover:bg-purple-700 disabled:bg-gray-400 text-white p-3 rounded-lg shadow transition-colors"
                            >
                                {loading && reportType === 'HISTORICO' ? <FaSpinner className="animate-spin" /> : <FaDownload />}
                            </button>
                        </div>
                    </div>

                </div>

                {/* Botón Cerrar Inferior */}
                <div className="mt-8 text-center">
                    <button
                        onClick={onClose}
                        disabled={loading}
                        className="bg-gray-800 hover:bg-gray-900 disabled:bg-gray-400 text-white font-bold py-2 px-8 rounded-lg shadow-lg transition-colors"
                    >
                        Cerrar
                    </button>
                </div>

            </div>
        </div>
    );
};