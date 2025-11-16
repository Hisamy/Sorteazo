import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { TopNavBar } from './util-components/TopNavBar';
import { FaArrowLeft } from 'react-icons/fa';
import prizeImage from './assets/images/sorteo-placeholder.png';
import { AccordionBoletos } from './consulta-sorteo-components/AccordionBoletos';
import { BoletoGrid } from './consulta-sorteo-components/BoletoGrid';
import { BoletoDetalleModal } from './consulta-sorteo-components/BoletoDetalleModal';

// Simula la llamada al backend y genera datos con la estructura correcta
const fetchBoletosDeSorteo = (totalBoletos) => {
    let boletos = [];
    for (let i = 1; i <= totalBoletos; i++) {
        boletos.push({
            id: `boleto-${i}`,
            number: i,
            price: 50, // Precio base
            isReserved: Math.random() < 0.15, // 15% de probabilidad de estar reservado
        });
    }
    return boletos;
};

export const ConsultaSorteoOrganizador = () => {
    const { id } = useParams();
    const navigate = useNavigate();

    const [boletos, setBoletos] = useState([]);
    const [selectedBoleto, setSelectedBoleto] = useState(null);
    const [isModalOpen, setIsModalOpen] = useState(false);

    const sorteo = {
        id: id,
        nombre: 'Sorteo de navidad 2026',
        descripcion: 'Aquí va la descripción breve oficial del sorteo',
        precioBoleto: 50,
        numerosDisponibles: boletos.filter(b => !b.isReserved).length,
        numerosTotales: 300,
        imagen: prizeImage,
    };

    // Simula la carga de datos del backend cuando el componente se monta
    useEffect(() => {
        const datosDelBackend = fetchBoletosDeSorteo(sorteo.numerosTotales);
        setBoletos(datosDelBackend);
    }, [sorteo.numerosTotales]);

    const handleBoletoClick = (boleto) => {
        setSelectedBoleto(boleto);
        setIsModalOpen(true);
    };

    const closeModal = () => {
        setIsModalOpen(false);
        setSelectedBoleto(null);
    };

    return (
        <div className="min-h-screen bg-[var(--color-background)]">
            <TopNavBar showLogout={true} />

            <div className="container mx-auto px-8 py-10 max-w-5xl">
                <button onClick={() => navigate(-1)} className="flex items-center gap-2 text-gray-500 hover:text-gray-800 mb-6 font-afacad">
                    <FaArrowLeft />
                    Volver
                </button>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                    {/* Columna de Información */}
                    <div className="md:col-span-2">
                        <h1 className="font-afacad text-4xl font-bold text-[var(--color-dark-text)]">{sorteo.nombre}</h1>
                        <p className="font-afacad text-lg text-[var(--color-gray-text)] mt-2 mb-6">{sorteo.descripcion}</p>

                        <div className="flex gap-12 mb-6">
                            <div>
                                <p className="font-afacad text-sm text-gray-500">Precio del boleto:</p>
                                <p className="font-afacad text-2xl font-bold text-green-600">${sorteo.precioBoleto}</p>
                            </div>
                            <div>
                                <p className="font-afacad text-sm text-gray-500">Números disponibles:</p>
                                <p className="font-afacad text-2xl font-bold text-green-600">{sorteo.numerosDisponibles}/{sorteo.numerosTotales}</p>
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

                    {/* Columna de Imagen */}
                    <div className="flex flex-col items-center">
                        <img src={sorteo.imagen} alt="Premio del sorteo" className="w-full max-w-xs rounded-lg shadow-md object-cover" />
                        <button className="mt-4 bg-green-600 text-white font-afacad px-5 py-2 rounded-lg hover:bg-green-700 w-full max-w-xs">
                            Ver premios
                        </button>
                    </div>
                </div>

                {/* Sección de Boletos */}
                <div className="mt-12 space-y-4">
                    <AccordionBoletos title="Boletos 1-100" available={boletos.slice(0, 100).filter(b => !b.isReserved).length}>
                        <BoletoGrid boletos={boletos.slice(0, 100)} onBoletoClick={handleBoletoClick} />
                    </AccordionBoletos>
                    <AccordionBoletos title="Boletos 101-200" available={boletos.slice(100, 200).filter(b => !b.isReserved).length}>
                        <BoletoGrid boletos={boletos.slice(100, 200)} onBoletoClick={handleBoletoClick} />
                    </AccordionBoletos>
                    <AccordionBoletos title="Boletos 201-300" available={boletos.slice(200, 300).filter(b => !b.isReserved).length}>
                        <BoletoGrid boletos={boletos.slice(200, 300)} onBoletoClick={handleBoletoClick} />
                    </AccordionBoletos>
                </div>
            </div>

            <BoletoDetalleModal isOpen={isModalOpen} boleto={selectedBoleto} onClose={closeModal} />
        </div>
    );
};