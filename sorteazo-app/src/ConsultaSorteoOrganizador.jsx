import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate, useParams, useLocation } from 'react-router-dom';
import { TopNavBar } from './util-components/TopNavBar';
import { FaArrowLeft } from 'react-icons/fa';
import prizeImage from './assets/images/sorteo-placeholder.png';
import { AccordionBoletos } from './consulta-sorteo-components/AccordionBoletos';
import { BoletoGrid } from './consulta-sorteo-components/BoletoGrid';
import { BoletoDetalleModal } from './consulta-sorteo-components/BoletoDetalleModal';
import { obtenerSorteoPorId, obtenerBoletosPorSorteoOrganizador } from './services/SorteazoApi';
import { EmptyStateCard } from './util-components/EmptyStateCard';
import { PremiosModal } from './consulta-sorteo-components/PremiosModal';

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

                const boletosMapeados = boletosData.map(b => ({
                    ...b,
                    numero: b.number,
                    estado: b.isReserved ? 'apartado' : 'disponible'
                }));
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

    const numerosDisponibles = boletos.filter(b => !b.isReserved).length;
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
                        <h1 className="font-afacad text-4xl font-bold text-[var(--color-dark-text)]">{sorteo.title}</h1>
                        <p className="font-afacad text-lg text-[var(--color-gray-text)] mt-2 mb-6">{sorteo.description}</p>
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
                        <div className="flex items-center gap-6 text-sm text-gray-600 font-afacad">
                            <div className="flex items-center gap-2">
                                <div className="w-5 h-5 border border-gray-400 rounded"></div>
                                <span>Disponible</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <div className="w-5 h-5 bg-gray-400 rounded"></div>
                                <span>Apartado</span>
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
                        const startRange = (sorteo.startNumber || 0) + (index * CHUNK_SIZE);
                        const endRange = startRange + CHUNK_SIZE - 1;
                        const title = `Boletos ${startRange} - ${endRange}`;
                        const availableCount = chunk.filter(b => b.estado === 'disponible').length;

                        return (
                            <AccordionBoletos key={index} title={title} available={availableCount}>
                                <BoletoGrid boletos={chunk} onBoletoClick={handleBoletoClick} />
                            </AccordionBoletos>
                        );
                    })}
                </div>
            </div>
            <BoletoDetalleModal isOpen={isModalOpen} boleto={selectedBoleto} onClose={closeModal} />
            <PremiosModal
                isOpen={isPremiosModalOpen}
                premios={sorteo?.premios}
                onClose={() => setIsPremiosModalOpen(false)}
            />
        </div>
    );
};