import React, { useState, useMemo, useEffect } from 'react';
import { useNavigate, useParams, useLocation } from 'react-router-dom';
import { TopNavBar } from './util-components/TopNavBar';
import { FaArrowLeft } from 'react-icons/fa';
import prizeImage from './assets/images/sorteo-placeholder.png';
import { AccordionBoletos } from './consulta-sorteo-components/AccordionBoletos';
import { BoletoGrid } from './consulta-sorteo-components/BoletoGrid';
import { obtenerSorteoPorId, obtenerBoletosPorSorteoCliente, apartarBoletosPorCliente, obtenerUsuarioActual } from './services/SorteazoApi';
import { procesarPagoTransferencia, procesarPagoEnLinea } from './controllers/PagosController';
import { EmptyStateCard } from './util-components/EmptyStateCard';
import { PremiosModal } from './consulta-sorteo-components/PremiosModal';
import { FloatingActionBar } from './consulta-sorteo-components/FloatingActionBar';
import { ConfirmacionApartadoModal } from './consulta-sorteo-components/ConfirmacionApartadoModal';
import { PagarBoletosModal } from './consulta-sorteo-components/PagarBoletosModal';
import Swal from "sweetalert2";

export const ConsultaSorteoCliente = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const location = useLocation();

    const [sorteo, setSorteo] = useState(location.state?.sorteo || null);
    const [boletos, setBoletos] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [seleccionados, setSeleccionados] = useState([]);
    const [isPremiosModalOpen, setIsPremiosModalOpen] = useState(false);
    const [isConfirmModalOpen, setIsConfirmModalOpen] = useState(false);
    const [isPagoModalOpen, setIsPagoModalOpen] = useState(false);
    const [modoSeleccion, setModoSeleccion] = useState('apartar'); // 'apartar' | 'pagar'
    const [currentUserId, setCurrentUserId] = useState(null);

    useEffect(() => {
        const cargarDatosSorteo = async () => {
            try {
                setLoading(true);
                
                // Obtener el usuario actual autenticado (desde JWT en cookies)
                const usuarioActual = await obtenerUsuarioActual();
                const currentUserId = usuarioActual?.id || usuarioActual?.userId;
                setCurrentUserId(currentUserId);
                console.log("Usuario actual autenticado:", usuarioActual, "ID:", currentUserId);
                
                // Siempre obtener los datos completos del sorteo para asegurar que tengamos los premios
                const data = await obtenerSorteoPorId(id);
                console.log("Datos del sorteo obtenidos:", data);
                console.log("Premios del sorteo:", data.premios);
                const fullImageUrl = data.imageUrl
                    ? `${import.meta.env.VITE_API_URL}${data.imageUrl}`
                    : prizeImage;

                const sorteoData = { ...data, imageUrl: fullImageUrl, premios: data.premios || [] };
                setSorteo(sorteoData);

                const boletosData = await obtenerBoletosPorSorteoCliente(id);
                console.log("Boletos obtenidos del backend:", boletosData);
                
                const boletosMapeados = boletosData.map(b => {
                    let estadoFrontend = 'disponible';
                    const numeroActual = Number(b.number);
                    
                    switch(b.status) {
                        case 'DISPONIBLE':
                            estadoFrontend = 'disponible';
                            break;
                        case 'RESERVADO':
                            estadoFrontend = 'apartadoOtro';
                            break;
                        case 'PAGO_PENDIENTE':
                            // Amarillo si es mío (pago pendiente de aprobación)
                            // Gris si es de otro
                            const boletoClientId = String(b.clientId || '');
                            const usuarioId = String(currentUserId || '');
                            
                            if (boletoClientId && usuarioId && boletoClientId === usuarioId) {
                                estadoFrontend = 'apartadoMio';
                            } else {
                                estadoFrontend = 'apartadoOtro';
                            }
                            break;
                        case 'PAGADO':
                            // Azul para todos - Ya está pagado y confirmado
                            estadoFrontend = 'pagado';
                            break;
                        default:
                            estadoFrontend = 'disponible';
                    }
                    
                    return {
                        ...b,
                        numero: numeroActual,
                        price: b.price,
                        estado: estadoFrontend
                    };
                });
                
                console.log("Boletos mapeados:", boletosMapeados.filter(b => b.estado === 'apartadoMio'));
                
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

    const handleBoletoClick = (numero) => {
        const boleto = boletos.find(b => b.numero === numero);
        if (!boleto) return;
        
        // Caso 1: Boleto disponible → Modo apartar
        if (boleto.estado === 'disponible') {
            setModoSeleccion('apartar');
            // Si ya hay boletos apartados seleccionados, limpiar
            setSeleccionados(prev => {
                const tieneApartados = prev.some(num => {
                    const b = boletos.find(x => x.numero === num);
                    return b?.estado === 'apartadoMio';
                });
                if (tieneApartados) return [numero];
                return prev.includes(numero) 
                    ? prev.filter(n => n !== numero)
                    : [...prev, numero];
            });
        }
        // Caso 2: Boleto apartado por MÍ → Modo pagar (clickeable)
        else if (boleto.estado === 'apartadoMio') {
            setModoSeleccion('pagar');
            // Si ya hay boletos disponibles seleccionados, limpiar
            setSeleccionados(prev => {
                const tieneDisponibles = prev.some(num => {
                    const b = boletos.find(x => x.numero === num);
                    return b?.estado === 'disponible';
                });
                if (tieneDisponibles) return [numero];
                return prev.includes(numero)
                    ? prev.filter(n => n !== numero)
                    : [...prev, numero];
            });
        }
        // Caso 3: Boleto apartado por OTRO → Bloqueado (no hacer nada)
        else if (boleto.estado === 'apartadoOtro') {
            return;
        }
        // Caso 4: Boleto pagado → Bloqueado (no hacer nada)
        else if (boleto.estado === 'pagado') {
            return;
        }
    };

    const handleConfirmarApartado = async () => {
        console.log('Apartando boletos:', seleccionados);

        // Actualizar estado local optimistamente
        setBoletos(prevBoletos =>
            prevBoletos.map(boleto => {
                if (seleccionados.includes(boleto.numero)) {
                    return { ...boleto, estado: 'apartadoMio', status: 'PAGO_PENDIENTE' };
                }
                return boleto;
            })
        );

        try {
            const response = await apartarBoletosPorCliente(sorteo.id, seleccionados);
            setIsConfirmModalOpen(false);
            setSeleccionados([]);
            await Swal.fire({
                icon: "success",
                title: "Apartado exitoso",
                text: response.message
            });
        } catch (err) {
            await Swal.fire({
                icon: "error",
                title: "No se pudo apartar",
                text: err?.message || "Intenta nuevamente más tarde."
            });
        }
    };

    const handleConfirmarPago = async ({ metodoPago, comprobanteFile, boletos: boletosAPagar }) => {
        console.log('Procesando pago:', { 
            metodoPago, 
            boletosAPagar,
            comprobanteFile: comprobanteFile?.name 
        });

        try {
            // Obtener los IDs de los boletos seleccionados
            const boletoIds = seleccionados
                .map(num => boletos.find(b => b.numero === num))
                .filter(Boolean)
                .map(b => b.id);

            console.log('IDs de boletos a pagar:', boletoIds);

            let resultado;
            
            if (metodoPago === 'TRANSFERENCIA') {
                resultado = await procesarPagoTransferencia(boletoIds, comprobanteFile);
            } else if (metodoPago === 'PAGO EN LINEA') {
                resultado = await procesarPagoEnLinea(boletoIds);
            }

            // Cerrar modal
            setIsPagoModalOpen(false);
            setSeleccionados([]);

            // Recargar los boletos para obtener el estado actualizado
            const boletosData = await obtenerBoletosPorSorteoCliente(id);
            const usuarioActual = await obtenerUsuarioActual();
            const currentUserId = usuarioActual?.id || usuarioActual?.userId;
            
            const boletosMapeados = boletosData.map(b => {
                let estadoFrontend = 'disponible';
                const numeroActual = Number(b.number);
                
                switch(b.status) {
                    case 'DISPONIBLE':
                        estadoFrontend = 'disponible';
                        break;
                    case 'RESERVADO':
                        estadoFrontend = 'apartadoOtro';
                        break;
                    case 'PAGO_PENDIENTE':
                        const boletoClientId = String(b.clientId || '');
                        const usuarioId = String(currentUserId || '');
                        estadoFrontend = (boletoClientId && usuarioId && boletoClientId === usuarioId) 
                            ? 'apartadoMio' 
                            : 'apartadoOtro';
                        break;
                    case 'PAGADO':
                        estadoFrontend = 'pagado';
                        break;
                    default:
                        estadoFrontend = 'disponible';
                }
                
                return {
                    ...b,
                    numero: numeroActual,
                    price: b.price,
                    estado: estadoFrontend
                };
            });
            
            boletosMapeados.sort((a, b) => (a.numero || 0) - (b.numero || 0));
            setBoletos(boletosMapeados);

            // Mostrar mensaje de éxito
            await Swal.fire({
                icon: "success",
                title: "Pago Registrado",
                text: metodoPago === 'TRANSFERENCIA' 
                    ? `Se ha registrado tu pago por ${boletoIds.length} boleto(s). El organizador verificará tu comprobante.`
                    : `¡Pago procesado exitosamente! Tus ${boletoIds.length} boleto(s) han sido pagados con tarjeta.`,
                confirmButtonText: "Entendido"
            });

        } catch (error) {
            console.error('Error al procesar pago:', error);
            setIsPagoModalOpen(false);
            
            await Swal.fire({
                icon: "error",
                title: "Error al procesar pago",
                text: error?.response?.data?.message || error?.message || "No se pudo procesar el pago. Intenta nuevamente.",
                confirmButtonText: "Entendido"
            });
        }
    };

    const boletosParaMostrar = useMemo(() => {
        if (!boletos) return [];
        return boletos.map(boleto => {
            if (seleccionados.includes(boleto.numero)) {
                return { ...boleto, estado: 'seleccionado' };
            }
            return boleto;
        });
    }, [boletos, seleccionados]);

    const CHUNK_SIZE = 100;
    const boletosAgrupados = useMemo(() => {
        if (!boletosParaMostrar || boletosParaMostrar.length === 0) return [];
        const chunks = [];
        for (let i = 0; i < boletosParaMostrar.length; i += CHUNK_SIZE) {
            chunks.push(boletosParaMostrar.slice(i, i + CHUNK_SIZE));
        }
        return chunks;
    }, [boletosParaMostrar]);

    if (loading && !sorteo) {
        return <div className="flex justify-center items-center h-screen">Cargando sorteo...</div>;
    }

    if (error) {
        return <div className="container mx-auto p-8"><EmptyStateCard message={error} /></div>;
    }

    if (!sorteo) {
        return <div className="container mx-auto p-8"><EmptyStateCard message="Sorteo no encontrado." /></div>;
    }

    const totalAPagar = seleccionados.length * sorteo.ticketPrice;
    const numerosTotales = sorteo.numbersQuantity || boletos.length;

    return (
        <div className="min-h-screen bg-[var(--color-background)] pb-32">
            <TopNavBar showLogout={true} />
            <div className="container mx-auto px-8 py-10 max-w-5xl">
                <button onClick={() => navigate(-1)} className="flex items-center gap-2 text-gray-500 hover:text-gray-800 mb-6 font-afacad">
                    <FaArrowLeft />
                    Volver
                </button>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                    <div className="md:col-span-2">
                        <h1 className="font-afacad text-4xl font-bold text-[var(--color-dark-text)]">{sorteo.title}</h1>
                        <p className="font-afacad text-lg text-[var(--color-gray-text)] mt-2 mb-6 break-words whitespace-pre-line">{sorteo.description}</p>
                        <div className="flex gap-12 mb-6">
                            <div>
                                <p className="font-afacad text-sm text-gray-500">Precio del boleto:</p>
                                <p className="font-afacad text-2xl font-bold text-green-600">${sorteo.ticketPrice}</p>
                            </div>
                            <div>
                                <p className="font-afacad text-sm text-gray-500">Números disponibles:</p>
                                <p className="font-afacad text-2xl font-bold text-green-600">{boletos.filter(b => b.estado === 'disponible').length}/{numerosTotales}</p>
                            </div>
                        </div>
                        <div className="flex items-center gap-4 text-sm text-gray-600 font-afacad flex-wrap">
                            <div className="flex items-center gap-2">
                                <div className="w-5 h-5 border-2 border-gray-400 rounded-full bg-white"></div>
                                <span>Disponible</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <div className="w-5 h-5 bg-yellow-400 rounded-full"></div>
                                <span>Mis Apartados</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <div className="w-5 h-5 bg-gray-400 rounded-full"></div>
                                <span>Apartado</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <div className="w-5 h-5 bg-blue-500 rounded-full"></div>
                                <span>Pagado</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <div className="w-5 h-5 bg-green-600 rounded-full"></div>
                                <span>Seleccionado</span>
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
                                <BoletoGrid
                                    boletos={chunk}
                                    onBoletoClick={handleBoletoClick}
                                />
                            </AccordionBoletos>
                        );
                    })}
                </div>
            </div>
            <PremiosModal
                isOpen={isPremiosModalOpen}
                premios={sorteo?.premios}
                onClose={() => setIsPremiosModalOpen(false)}
            />
            {seleccionados.length > 0 && (
                <FloatingActionBar
                    count={seleccionados.length}
                    totalPrice={totalAPagar}
                    mode={modoSeleccion}
                    onActionClick={() => {
                        if (modoSeleccion === 'pagar') {
                            setIsPagoModalOpen(true);
                        } else {
                            setIsConfirmModalOpen(true);
                        }
                    }}
                />
            )}
            <ConfirmacionApartadoModal
                isOpen={isConfirmModalOpen}
                onClose={() => setIsConfirmModalOpen(false)}
                onConfirm={handleConfirmarApartado}
                seleccionados={seleccionados}
                precioBoleto={sorteo.ticketPrice}
            />
            <PagarBoletosModal
                isOpen={isPagoModalOpen}
                onClose={() => {
                    setIsPagoModalOpen(false);
                    setSeleccionados([]);
                }}
                onConfirm={handleConfirmarPago}
                boletos={seleccionados.map(num => boletos.find(b => b.numero === num)).filter(Boolean)}
                precioBoleto={sorteo.ticketPrice}
            />
        </div>
    );
};