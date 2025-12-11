import React, { useState, useEffect, useMemo } from 'react';
import {
    useNavigate,
    useParams,
    useLocation
} from 'react-router-dom';
import { TopNavBar } from './util-components/TopNavBar';
import { FaArrowLeft } from 'react-icons/fa';
import prizeImage from './assets/images/sorteo-placeholder.png';
import { AccordionBoletos } from './consulta-sorteo-components/AccordionBoletos';
import { BoletoGrid } from './consulta-sorteo-components/BoletoGrid';
import { BoletoDetalleModal } from './consulta-sorteo-components/BoletoDetalleModal';
import {
    obtenerSorteoPorId,
    obtenerBoletosPorSorteoOrganizador,
    liberarBoletos,
} from './services/SorteazoApi';
import { aprobarPago, denegarPago } from './controllers/PagosController';
import {
    getReporteHistorico,
    getReporteDeudores,
    getReporteEstado
} from './controllers/SorteoController.js'
import { generarPDF } from './consulta-sorteo-components/PdfGenerator.js';
import { EmptyStateCard } from './util-components/EmptyStateCard';
import { PremiosModal } from './consulta-sorteo-components/PremiosModal';
import { GenerarReporteModal } from './consulta-sorteo-components/GenerarReporteModal';
import Swal from 'sweetalert2';

export const ConsultaSorteoOrganizador = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const location = useLocation();

    const [sorteo, setSorteo] = useState(location.state?.sorteo || null);
    const [boletos, setBoletos] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [selectedBoleto, setSelectedBoleto] = useState(null);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isPremiosModalOpen, setIsPremiosModalOpen] = useState(false);
    const [isGenerarReporteModalOpen, setIsGenerarReporteModalOpen] = useState(false);

    useEffect(() => {
        const cargarDatosSorteo = async () => {
            try {
                setLoading(true);
                let sorteoData = sorteo;

                if (!sorteoData) {
                    const data = await obtenerSorteoPorId(id);
                    const fullImageUrl = data.imageUrl
                        ? `${import.meta.env.VITE_API_URL}${data.imageUrl}`
                        : prizeImage;

                    sorteoData = { ...data, imageUrl: fullImageUrl, premios: data.premios || [] };
                    setSorteo(sorteoData);
                }

                const boletosData = await obtenerBoletosPorSorteoOrganizador(id);

                const boletosMapeados = boletosData.map(b => {
                    let estadoFrontend = 'disponible';

                    switch (b.status) {
                        case 'DISPONIBLE':
                            estadoFrontend = 'disponible';
                            break;
                        case 'RESERVADO':
                            estadoFrontend = 'apartado';
                            break;
                        case 'PAGO_PENDIENTE':
                            // Amarillo - Pago pendiente de aprobación
                            estadoFrontend = 'apartado';
                            break;
                        case 'PAGADO':
                            // Azul - Ya pagado y confirmado
                            estadoFrontend = 'pagado';
                            break;
                        default:
                            estadoFrontend = 'disponible';
                    }

                    return {
                        ...b,
                        numero: Number(b.number),
                        price: b.price,
                        estado: estadoFrontend
                    };
                });

                // ordenar por número ascendente antes de agrupar
                boletosMapeados.sort((a, b) => (a.numero || 0) - (b.numero || 0));
                setBoletos(boletosMapeados);

            } catch (err) {
                setError("No se pudo cargar la información del sorteo.");
                console.error(err);
            } finally {
                setLoading(false);
            }
        };
        cargarDatosSorteo();
    }, [id]);

    const handleGenerarReporte = async (tipo) => {
        try {
            let data = [];
            let tituloReporte = "";
            let nombreArchivo = sorteo?.title ? sorteo.title.replace(/\s+/g, '_') : 'Sorteo';

            // Función auxiliar para formatear moneda
            const fmtMoney = (amount) => `$${Number(amount || 0).toFixed(2)}`;

            switch (tipo) {

                // CASO 1: REPORTE DE DEUDORES
                case 'DEUDORES':
                    const deudoresRaw = await getReporteDeudores(id);

                    data = deudoresRaw.map(d => {
                        const cliente = d.client || {};

                        return {
                            "Número": d.number,
                            "Cliente": cliente.name || 'Desconocido',
                            "Teléfono": cliente.phone || '-',
                            "Email": cliente.email || '-',
                            "Monto Deuda": fmtMoney(d.debtAmount),
                            "Fecha Límite": d.paymentDeadline ? new Date(d.paymentDeadline).toLocaleDateString() : '-'
                        };
                    });

                    tituloReporte = `Reporte de Deudores - ${sorteo?.title}`;
                    nombreArchivo = `Deudores_${nombreArchivo}`;
                    break;


                // CASO 2: ESTADO DE BOLETOS
                case 'ESTADO':
                    if (!boletos || boletos.length === 0) throw new Error("No hay boletos cargados");

                    data = boletos.map(b => {
                        return {
                            "Número": b.numero,
                            "Estado": b.estado.toUpperCase(),
                            "Cliente": (b.estado === 'disponible') ? '-' : b.client?.name
                        };
                    });

                    tituloReporte = `Estado General de Boletos - ${sorteo?.title}`;
                    nombreArchivo = `Estado_Boletos_${nombreArchivo}`;
                    break;

                // CASO 3: HISTÓRICO
                case 'HISTORICO':
                    const historicoRaw = await getReporteHistorico();

                    const listaHistorico = Array.isArray(historicoRaw) ? historicoRaw : [];

                    data = listaHistorico.map(h => {
                        const financials = h.financials || { collected: 0, pending: 0 };
                        const counts = h.counts || { sold: 0, unpaid: 0, free: 0 };

                        return {
                            "Sorteo": h.name,
                            "Fecha Sorteo": h.drawDate ? new Date(h.drawDate).toLocaleDateString() : '-',
                            "Estado": h.status === 'FINISHED' ? 'Finalizado' : 'Activo',
                            "Recaudado": fmtMoney(financials.collected),
                            "Pendiente": fmtMoney(financials.pending),
                            "Vendidos": counts.sold,
                            "Por Pagar": counts.unpaid,
                            "Libres": counts.free
                        };
                    });

                    tituloReporte = "Histórico General de Sorteos";
                    nombreArchivo = "Historico_General";
                    break;

                default:
                    return;
            }

            // Generar el PDF
            generarPDF(data, tituloReporte, nombreArchivo);

            const Toast = Swal.mixin({
                toast: true, position: 'top-end', showConfirmButton: false, timer: 3000, timerProgressBar: true
            });
            Toast.fire({ icon: 'success', title: 'Reporte generado' });

        } catch (error) {
            console.error("Error al generar reporte:", error);

            if (error.response && error.response.status === 404) {
                Swal.fire({
                    icon: 'error',
                    title: 'Ruta no encontrada (404)',
                });
            } else {
                Swal.fire({
                    icon: 'error',
                    title: 'Error',
                    text: 'No se pudo generar el reporte.'
                });
            }
        }
    };

    const handleBoletoClick = (numeroBoleto) => {
        const boletoSeleccionado = boletos.find(b => b.numero === numeroBoleto);
        if (boletoSeleccionado) {
            setSelectedBoleto(boletoSeleccionado);
            setIsModalOpen(true);
        }
    };

    const closeModal = () => {
        setIsModalOpen(false);
        setSelectedBoleto(null);
    };

    const handleConfirmarPago = async (pagoId) => {
        try {
            await aprobarPago(pagoId);

            await Swal.fire({
                icon: 'success',
                title: 'Pago Aprobado',
                text: 'El pago ha sido confirmado exitosamente.',
                confirmButtonText: 'Entendido'
            });

            // Recargar boletos
            const boletosData = await obtenerBoletosPorSorteoOrganizador(id);
            const boletosMapeados = boletosData.map(b => {
                let estadoFrontend = 'disponible';

                switch (b.status) {
                    case 'DISPONIBLE':
                        estadoFrontend = 'disponible';
                        break;
                    case 'RESERVADO':
                        estadoFrontend = 'apartado';
                        break;
                    case 'PAGO_PENDIENTE':
                        estadoFrontend = 'apartado';
                        break;
                    case 'PAGADO':
                        estadoFrontend = 'pagado';
                        break;
                    default:
                        estadoFrontend = 'disponible';
                }

                return {
                    ...b,
                    numero: Number(b.number),
                    price: b.price,
                    estado: estadoFrontend
                };
            });

            boletosMapeados.sort((a, b) => (a.numero || 0) - (b.numero || 0));
            setBoletos(boletosMapeados);

        } catch (error) {
            await Swal.fire({
                icon: 'error',
                title: 'Error',
                text: error.message || 'No se pudo aprobar el pago',
                confirmButtonText: 'Entendido'
            });
        }
    };

    const handleLiberarBoleto = async (boletoId) => {
        const result = await Swal.fire({
            icon: 'warning',
            title: '¿Liberar boleto?',
            text: 'El boleto volverá a estar disponible y se perderán los datos del cliente.',
            showCancelButton: true,
            confirmButtonText: 'Sí, liberar',
            cancelButtonText: 'Cancelar',
            confirmButtonColor: '#374151'
        });

        if (!result.isConfirmed) return;

        try {
            await liberarBoletos([boletoId]);

            await Swal.fire({
                icon: 'success',
                title: 'Boleto Liberado',
                text: 'El boleto ha sido liberado exitosamente.',
                confirmButtonText: 'Entendido'
            });

            // Recargar boletos
            const boletosData = await obtenerBoletosPorSorteoOrganizador(id);
            const boletosMapeados = boletosData.map(b => {
                let estadoFrontend = 'disponible';

                switch (b.status) {
                    case 'DISPONIBLE':
                        estadoFrontend = 'disponible';
                        break;
                    case 'RESERVADO':
                        estadoFrontend = 'apartado';
                        break;
                    case 'PAGO_PENDIENTE':
                        estadoFrontend = 'apartado';
                        break;
                    case 'PAGADO':
                        estadoFrontend = 'pagado';
                        break;
                    default:
                        estadoFrontend = 'disponible';
                }

                return {
                    ...b,
                    numero: Number(b.number),
                    price: b.price,
                    estado: estadoFrontend
                };
            });

            boletosMapeados.sort((a, b) => (a.numero || 0) - (b.numero || 0));
            setBoletos(boletosMapeados);

        } catch (error) {
            await Swal.fire({
                icon: 'error',
                title: 'Error',
                text: error.response?.data?.message || 'No se pudo liberar el boleto',
                confirmButtonText: 'Entendido'
            });
        }
    };

    const handleRechazarPago = async (pagoId) => {
        const result = await Swal.fire({
            icon: 'warning',
            title: '¿Rechazar pago?',
            text: 'El boleto volverá a estar disponible. Esta acción no se puede deshacer.',
            showCancelButton: true,
            confirmButtonText: 'Sí, rechazar',
            cancelButtonText: 'Cancelar',
            confirmButtonColor: '#dc2626'
        });

        if (!result.isConfirmed) return;

        try {
            await denegarPago(pagoId);

            await Swal.fire({
                icon: 'success',
                title: 'Pago Rechazado',
                text: 'El pago ha sido rechazado y el boleto está disponible nuevamente.',
                confirmButtonText: 'Entendido'
            });

            // Recargar boletos
            const boletosData = await obtenerBoletosPorSorteoOrganizador(id);
            const boletosMapeados = boletosData.map(b => {
                let estadoFrontend = 'disponible';

                switch (b.status) {
                    case 'DISPONIBLE':
                        estadoFrontend = 'disponible';
                        break;
                    case 'RESERVADO':
                        estadoFrontend = 'apartado';
                        break;
                    case 'PAGO_PENDIENTE':
                        estadoFrontend = 'apartado';
                        break;
                    case 'PAGADO':
                        estadoFrontend = 'pagado';
                        break;
                    default:
                        estadoFrontend = 'disponible';
                }

                return {
                    ...b,
                    numero: Number(b.number),
                    price: b.price,
                    estado: estadoFrontend
                };
            });

            boletosMapeados.sort((a, b) => (a.numero || 0) - (b.numero || 0));
            setBoletos(boletosMapeados);

        } catch (error) {
            await Swal.fire({
                icon: 'error',
                title: 'Error',
                text: error.message || 'No se pudo rechazar el pago',
                confirmButtonText: 'Entendido'
            });
        }
    };

    const CHUNK_SIZE = 100;
    const boletosAgrupados = useMemo(() => {
        if (!boletos || boletos.length === 0) return [];
        const chunks = [];
        for (let i = 0; i < boletos.length; i += CHUNK_SIZE) {
            chunks.push(boletos.slice(i, i + CHUNK_SIZE));
        }
        return chunks;
    }, [boletos]);

    if (loading && !sorteo) {
        return <div className="flex justify-center items-center h-screen">Cargando sorteo...</div>;
    }

    if (error) {
        return <div className="container mx-auto p-8"><EmptyStateCard message={error} /></div>;
    }

    if (!sorteo) {
        return <div className="container mx-auto p-8"><EmptyStateCard message="Sorteo no encontrado." /></div>;
    }

    const numerosDisponibles = boletos.filter(b => b.estado === 'disponible').length;
    const numerosTotales = sorteo.numbersQuantity || boletos.length;

    return (
        <div className="min-h-screen bg-[var(--color-background)]">
            <TopNavBar showLogout={true} />
            <div className="container mx-auto px-8 py-10 max-w-5xl">
                <button onClick={() => navigate(-1)} className="flex items-center gap-2 text-gray-500 hover:text-gray-800 mb-6 font-afacad">
                    <FaArrowLeft />
                    Volver
                </button>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                    <div className="md:col-span-2">
                        <h1 className="font-afacad text-4xl font-bold text-[var(--color-dark-text)] break-words whitespace-pre-line">{sorteo.title}</h1>
                        <p className="font-afacad text-lg text-[var(--color-gray-text)] mt-2 mb-6 break-words whitespace-pre-line">{sorteo.description}</p>
                        <div className="flex gap-12 mb-6">
                            <div>
                                <p className="font-afacad text-sm text-gray-500">Precio del boleto:</p>
                                <p className="font-afacad text-2xl font-bold text-green-600">${sorteo.ticketPrice}</p>
                            </div>
                            <div>
                                <p className="font-afacad text-sm text-gray-500">Números disponibles:</p>
                                <p className="font-afacad text-2xl font-bold text-green-600">{numerosDisponibles}/{numerosTotales}</p>
                            </div>
                        </div>
                        <div className="flex items-center gap-4 text-sm text-gray-600 font-afacad flex-wrap">
                            <div className="flex items-center gap-2">
                                <div className="w-5 h-5 border-2 border-gray-400 rounded-full bg-white"></div>
                                <span>Disponible</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <div className="w-5 h-5 bg-yellow-400 rounded-full"></div>
                                <span>Apartado</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <div className="w-5 h-5 bg-blue-500 rounded-full"></div>
                                <span>Pagado</span>
                            </div>
                        </div>
                    </div>
                    <div className="flex flex-col items-center">
                        <img src={sorteo.imageUrl} alt="Premio del sorteo" className="w-full max-w-xs rounded-lg shadow-md object-cover" />
                        <button
                            onClick={() => setIsPremiosModalOpen(true)}
                            className="mt-4 bg-green-600 text-white font-afacad px-5 py-2 rounded-lg hover:bg-green-700 w-full max-w-xs">
                            Ver premios
                        </button>
                        <button
                            onClick={() => setIsGenerarReporteModalOpen(true)}
                            className="mt-4 bg-green-600 text-white font-afacad px-5 py-2 rounded-lg hover:bg-green-700 w-full max-w-xs">
                            Generar Reporte
                        </button>
                    </div>
                </div>
                <div className="mt-12 space-y-4">
                    {boletosAgrupados.map((chunk, index) => {
                        const numeros = chunk.map(b => Number(b.numero)).filter(n => !Number.isNaN(n));
                        const hasStart = typeof sorteo.startNumber === 'number' && !Number.isNaN(sorteo.startNumber);
                        const startRange = hasStart ? (sorteo.startNumber + index * CHUNK_SIZE) : (numeros.length ? Math.min(...numeros) : 0);
                        const endRange = hasStart ? (startRange + chunk.length - 1) : (numeros.length ? Math.max(...numeros) : startRange + chunk.length - 1);
                        const title = `Boletos ${startRange} - ${endRange}`;
                        const availableCount = chunk.filter(b => b.estado === 'disponible').length;

                        return (
                            <AccordionBoletos key={index} title={title} available={availableCount}>
                                <BoletoGrid boletos={chunk} onBoletoClick={handleBoletoClick} isOrganizer={true} />
                            </AccordionBoletos>
                        );
                    })}
                </div>
            </div>
            <BoletoDetalleModal
                isOpen={isModalOpen}
                boleto={selectedBoleto}
                onClose={closeModal}
                isOrganizer={true}
                onConfirmarPago={handleConfirmarPago}
                onRechazarPago={handleRechazarPago}
                onLiberarBoleto={handleLiberarBoleto}
            />
            <PremiosModal
                isOpen={isPremiosModalOpen}
                premios={sorteo?.premios}
                onClose={() => setIsPremiosModalOpen(false)}
            />
            <GenerarReporteModal
                isOpen={isGenerarReporteModalOpen}
                onClose={() => setIsGenerarReporteModalOpen(false)}
                onGenerarReporte={handleGenerarReporte}
            />


        </div >
    );
};