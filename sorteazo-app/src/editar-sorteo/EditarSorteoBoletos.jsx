import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Swal from 'sweetalert2';
import { InputForm } from '../form-components/InputForm';
import { FaTicketAlt } from "react-icons/fa";

export function EditarSorteoBoletos() {
    const { id } = useParams();
    const navigate = useNavigate();

    // Estado para los datos y carga
    const [initialData, setInitialData] = useState(null);
    const [loading, setLoading] = useState(true);

    // Simulamos la carga de datos del backend
    useEffect(() => {
        const cargarDatos = async () => {
            try {
                // Aquí iría tu fetch: await getSorteoBoletos(id);
                console.log("Cargando datos de boletos para ID:", id);

                setTimeout(() => {
                    setInitialData({
                        title: "Sorteo Navideño 2025",
                        cantidadBoletos: 100,
                        inicioNumeracion: 1,
                        precioBoleto: 50.00
                    });
                    setLoading(false);
                }, 500);
            } catch (error) {
                console.error("Error cargando datos", error);
                setLoading(false);
            }
        };

        cargarDatos();
    }, [id]);

    const handleSubmit = (e) => {
        e.preventDefault();

        const formData = new FormData(e.target);
        const dataToUpdate = {
            cantidadBoletos: formData.get('cantidadBoletos'),
            inicioNumeracion: formData.get('inicioNumeracion'),
            precioBoleto: formData.get('precioBoleto')
        };

        const nombreSorteo = initialData?.title || "el sorteo";

        Swal.fire({
            title: 'Editar Boletos',
            text: `Vas a modificar la estructura de boletos de "${nombreSorteo}". ¿Estás seguro?`,
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#6B8E78',
            cancelButtonColor: '#d33',
            confirmButtonText: 'Sí, guardar cambios',
            cancelButtonText: 'Cancelar'
        }).then((result) => {
            if (result.isConfirmed) {
                console.log("Enviando datos:", dataToUpdate);

                Swal.fire({
                    title: '¡Actualizado!',
                    text: 'La configuración de boletos ha sido guardada.',
                    icon: 'success',
                    confirmButtonColor: '#6B8E78'
                }).then(() => {
                    navigate(-1);
                });
            }
        });
    };

    if (loading) {
        return <div className="p-10 text-center font-afacad text-lg">Cargando configuración de boletos...</div>;
    }

    return (
        <div className="bg-[var(--color-background)] min-h-screen p-8">
            <div className="bg-white p-8 rounded-lg shadow-sm max-w-3xl mx-auto border border-gray-100">

                {/* --- Header --- */}
                <div className="mb-8">
                    <div className="flex items-center gap-3 mb-2">
                        <div className="p-3 bg-green-100 text-[var(--color-primary)] rounded-full">
                            <FaTicketAlt size={24} />
                        </div>
                        <h2 className="text-3xl font-afacad font-bold text-[var(--color-dark-text)]">
                            Editar Boletos
                        </h2>
                    </div>
                    <p className="text-[var(--color-gray-text)] font-afacad text-sm ml-14">
                        Ajusta la cantidad, numeración y precio de los boletos.
                    </p>
                </div>

                {/* --- Formulario --- */}
                <form onSubmit={handleSubmit}>

                    {/* Grid de 2 columnas para Cantidad e Inicio */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                        <div>
                            <label className="block mb-2 text-[var(--color-primary)] font-semibold font-afacad">
                                Cantidad de boletos (1-1,000):
                            </label>
                            <InputForm
                                type="number"
                                placeholder="Ej. 100"
                                name="cantidadBoletos"
                                defaultValue={initialData.cantidadBoletos}
                            // error={errors?.cantidadBoletos}
                            />
                        </div>
                        <div>
                            <label className="block mb-2 text-[var(--color-primary)] font-semibold font-afacad">
                                Iniciar numeración desde:
                            </label>
                            <InputForm
                                type="number"
                                placeholder="Ej. 1"
                                name="inicioNumeracion"
                                defaultValue={initialData.inicioNumeracion}
                            // error={errors?.inicioNumeracion}
                            />
                        </div>
                    </div>

                    {/* Columna completa para Precio */}
                    <div className="mb-8">
                        <label className="block mb-2 text-[var(--color-primary)] font-semibold font-afacad">
                            Precio del boleto:
                        </label>
                        <InputForm
                            type="number"
                            placeholder="Ej. 50.00"
                            name="precioBoleto"
                            step="0.01"
                            defaultValue={initialData.precioBoleto}
                        // error={errors?.precioBoleto}
                        />
                    </div>

                    {/* --- Botones --- */}
                    <div className="flex justify-end items-center gap-4 mt-8 pt-6 border-t border-gray-100">
                        <button
                            type="button"
                            onClick={() => navigate(-1)}
                            className="px-6 py-2 rounded-lg bg-[#DEE2E6] text-gray-700 font-afacad font-semibold hover:bg-gray-300 transition-colors"
                        >
                            Cancelar
                        </button>
                        <button
                            type="submit"
                            className="px-6 py-2 rounded-lg bg-[#6B8E78] text-white font-afacad font-semibold hover:bg-[#5a7a66] transition-colors shadow-sm flex items-center gap-2"
                        >
                            <FaTicketAlt className="text-sm" />
                            Guardar
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}