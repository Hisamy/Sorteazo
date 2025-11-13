import React, { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { TopNavBar } from './util-components/TopNavBar';
import { FaArrowLeft } from 'react-icons/fa';
import prizeImage from './assets/images/sorteo-placeholder.png';
import { AccordionBoletos } from './consulta-sorteo-components/AccordionBoletos';
import { GridBoletos } from './consulta-sorteo-components/GridBoletos';

export const ConsultaSorteoCliente = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [selectedNumbers, setSelectedNumbers] = useState([]);

    const sorteo = {
        id: id,
        nombre: 'Sorteo de navidad 2026',
        descripcion: 'Aquí va la descripción breve oficial del sorteo',
        precioBoleto: 50,
        numerosDisponibles: 59,
        numerosTotales: 300,
        imagen: prizeImage,
    };

    // Números apartados de ejemplo (estos vendrían del backend)
    const reservedNumbers = [26, 35, 36, 37, 67, 68, 69];

    const handleNumberClick = (number) => {
        setSelectedNumbers(prev => {
            if (prev.includes(number)) {
                return prev.filter(n => n !== number);
            } else {
                return [...prev, number];
            }
        });
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
                            <div className="flex items-center gap-2">
                                <div className="w-5 h-5 bg-green-600 rounded"></div>
                                <span>Seleccionado</span>
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
                    <AccordionBoletos title="Boletos 1-100" available={95}>
                        <GridBoletos 
                            startNumber={1} 
                            endNumber={100} 
                            selectedNumbers={selectedNumbers}
                            onNumberClick={handleNumberClick}
                            reservedNumbers={reservedNumbers}
                        />
                    </AccordionBoletos>
                    <AccordionBoletos title="Boletos 101-200" available={47}>
                        <GridBoletos 
                            startNumber={101} 
                            endNumber={200} 
                            selectedNumbers={selectedNumbers}
                            onNumberClick={handleNumberClick}
                            reservedNumbers={[]}
                        />
                    </AccordionBoletos>
                    <AccordionBoletos title="Boletos 201-300" available={79}>
                        <GridBoletos 
                            startNumber={201} 
                            endNumber={300} 
                            selectedNumbers={selectedNumbers}
                            onNumberClick={handleNumberClick}
                            reservedNumbers={[]}
                        />
                    </AccordionBoletos>
                </div>
            </div>
        </div>
    );
};