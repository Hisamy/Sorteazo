import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { InputForm } from '../form-components/InputForm';
import { TextAreaForm } from '../form-components/TextAreaForm';
import { InputDate } from '../form-components/InputDate';
import { FaLock, FaTicketAlt, FaGift, FaArrowLeft } from "react-icons/fa";
import Swal from 'sweetalert2';
import { obtenerSorteoId, editaSorteo } from '../controllers/SorteoController';
import { gestorEditarSorteo } from './GestorEditarSorteo';


export function EditarSorteo() {
    const { id } = useParams();
    const navigate = useNavigate();

    const [initialData, setInitialData] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const cargarDatos = async () => {
            try {
                console.log("Cargando datos para el ID:", id);

                const data = await obtenerSorteoId(id);

                // Formatear fechas de ISO (2025-12-25T00:00:00.000Z) a YYYY-MM-DD
                const formatDate = (dateString) => {
                    if (!dateString) return '';
                    return dateString.split('T')[0];
                };

                // Datos para el formulario
                setInitialData({
                    ...data,
                    startDate: formatDate(data.saleStartDate),
                    endDate: formatDate(data.saleEndDate),
                    raffleDate: formatDate(data.raffleDateTime),
                    paymentDeadline: (data.paymentDeadlineDays),
                    imageName: data.imageUrl ? data.imageUrl.split('/').pop() : "imagen-actual.jpg"
                });

            } catch (error) {
                console.error("Error cargando sorteo", error);
                Swal.fire('Error', 'No se pudo cargar la información del sorteo.', 'error');
                navigate('/sorteos/organizador');
            } finally {
                setLoading(false);
            }
        };

        cargarDatos();
    }, [id, navigate]);

    const handleSubmit = (e) => {
        e.preventDefault();

        // CORREGIR: Guardar el resultado del gestor en una variable
        const datosActualizados = gestorEditarSorteo(e.target, initialData);

        console.log("Datos del gestor:", datosActualizados); // Para debug

        const formDataRaw = new FormData(e.target);
        const nombreSorteo = formDataRaw.get('title') || "el sorteo";

        Swal.fire({
            title: 'Guardar cambios',
            text: `¿Desea guardar los cambios de "${nombreSorteo}"?`,
            icon: 'question',
            showCancelButton: true,
            confirmButtonColor: '#6B8E78',
            cancelButtonColor: '#d33',
            confirmButtonText: 'Guardar',
            cancelButtonText: 'Cancelar'
        }).then(async (result) => {
            if (result.isConfirmed) {
                try {
                    // CORREGIR: Pasar datosActualizados (no formData)
                    await editaSorteo(id, datosActualizados);

                    Swal.fire({
                        title: '¡Guardado!',
                        text: 'El sorteo ha sido actualizado correctamente.',
                        icon: 'success',
                        confirmButtonColor: '#6B8E78'
                    }).then(() => {
                        navigate('/sorteos/organizador');
                    });

                } catch (error) {
                    console.error("Error al actualizar:", error);
                    const msg = error.response?.data?.message || 'Hubo un problema al guardar los cambios.';
                    Swal.fire({
                        title: 'Error',
                        text: Array.isArray(msg) ? msg[0] : msg,
                        icon: 'error',
                        confirmButtonColor: '#6B8E78'
                    });
                }
            }
        });
    };
    if (loading) {
        return <div className="p-10 text-center font-afacad">Cargando datos del sorteo...</div>;
    }

    const hayVentas = initialData?.boletos?.some(boleto => boleto.status === 'PAGADO');
    const canEditSensitiveData = !hayVentas;

    return (
        <div className="min-h-screen bg-[var(--color-background)] p-8">

            <div className="bg-white p-8 rounded-lg shadow-sm max-w-4xl mx-auto border border-gray-100">
                <button onClick={() => navigate(-1)} className="flex items-center gap-2 text-gray-500 hover:text-gray-800 mb-6 font-afacad">
                    <FaArrowLeft />
                    Volver
                </button>
                <h1 className="text-3xl font-afacad font-bold text-[var(--color-dark-text)] mb-2">
                    Editar Sorteo
                </h1>
                <p className="font-afacad text-lg text-[var(--color-gray-text)] mt-2 mb-6">
                    Los boletos y premios del sorteo solo pueden ser editados si ningún boleto ha sido comprado.
                </p>

                <form onSubmit={handleSubmit} encType="multipart/form-data">
                    <div className="grid grid-cols-1 gap-6 mb-8">

                        <div>
                            {/* Título */}
                            <div>
                                <label className="block mb-2 text-[var(--color-primary)] font-bold font-afacad">
                                    Título del Sorteo:
                                </label>
                                <InputForm
                                    placeholder="Ej. Sorteo de navidad"
                                    name="title"
                                    defaultValue={initialData.title}
                                    className="bg-white"
                                />
                            </div>

                            {/* Descripción */}
                            <div>
                                <label className="block mb-2 text-[var(--color-primary)] font-bold font-afacad">
                                    Descripción:
                                </label>
                                <TextAreaForm
                                    placeholder="Descripción del sorteo"
                                    name="description"
                                    rows={3}
                                    defaultValue={initialData.description}
                                />
                            </div>

                            {/* Imagen */}
                            <div>
                                <label className="block mb-2 text-[var(--color-primary)] font-bold font-afacad">
                                    Imagen:
                                </label>
                                <div className="flex items-center w-full border border-gray-300 rounded-xl px-2 py-2 bg-white">
                                    <label className="cursor-pointer bg-[#C0C0C0] hover:bg-gray-400 text-black font-afacad font-medium py-1 px-4 rounded shadow-sm transition-colors mr-3">
                                        Seleccionar archivo
                                        <input type="file" name="image" accept="image/*" className="hidden" />
                                    </label>
                                    <span className="text-gray-500 font-afacad text-sm italic">
                                        {initialData.imageName || "No se ha seleccionado nueva imagen"}
                                    </span>
                                </div>
                            </div>

                        </div>



                        {/* --- GRID DE FECHAS --- */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-2">

                            <InputDate
                                label="Inicio de venta:"
                                name="startDate"
                                defaultValue={initialData.startDate}
                            />

                            <InputDate
                                label="Fin de venta:"
                                name="endDate"
                                defaultValue={initialData.endDate}
                            />

                            {/* Plazo de días */}
                            <div>
                                <label className="flex items-center gap-2 mb-2 text-[var(--color-primary)] font-semibold font-afacad">
                                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                                        <path fillRule="evenodd" d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z" clipRule="evenodd" />
                                    </svg>
                                    Plazo de días para el pago del sorteo:
                                </label>
                                <InputForm
                                    type="number"
                                    name="paymentDeadline"
                                    defaultValue={initialData.paymentDeadline}
                                />
                            </div>

                            <InputDate
                                label="Fecha de realización sorteo:"
                                name="raffleDate"
                                defaultValue={initialData.raffleDate}
                            />
                        </div>


                    </div>

                    {/* --- BOTONES PREMIOS Y BOLETOS --- */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-10">

                        <button
                            type="button"
                            onClick={() => canEditSensitiveData && navigate(`/sorteos/organizador/editar-premios/${id}`)}
                            className={`
                                flex items-center justify-center gap-3 p-4 rounded-lg font-afacad font-bold text-lg transition-all duration-200 border
                                ${canEditSensitiveData
                                    ? 'bg-[var(--color-primary)] text-white hover:bg-[#3a5c45] shadow-md cursor-pointer border-transparent'
                                    : 'bg-gray-200 text-gray-500 cursor-not-allowed border-gray-300'}
                            `}
                        >
                            {canEditSensitiveData ? <FaGift /> : <FaLock />}
                            Editar Premios
                        </button>

                        <button
                            type="button"
                            onClick={() => canEditSensitiveData && navigate(`/sorteos/organizador/editar-boletos/${id}`)}
                            className={`
                                flex items-center justify-center gap-3 p-4 rounded-lg font-afacad font-bold text-lg transition-all duration-200 border
                                ${canEditSensitiveData
                                    ? 'bg-[var(--color-primary)] text-white hover:bg-[#3a5c45] shadow-md cursor-pointer border-transparent'
                                    : 'bg-gray-200 text-gray-500 cursor-not-allowed border-gray-300'}
                            `}
                        >
                            {canEditSensitiveData ? <FaTicketAlt /> : <FaLock />}
                            Editar Boletos
                        </button>
                    </div>

                    {/* Footer Buttons */}
                    <div className="flex justify-end items-center gap-4 mt-8 pt-6 border-t border-gray-100">
                        <button
                            type="button"
                            onClick={() => navigate('/sorteos/organizador')}
                            className="px-6 py-2 rounded-lg bg-[#DEE2E6] text-gray-700 font-afacad font-semibold hover:bg-gray-300 transition-colors"
                        >
                            Cancelar
                        </button>
                        <button
                            type="submit"
                            className="px-6 py-2 rounded-lg bg-[#6B8E78] text-white font-afacad font-semibold hover:bg-[#5a7a66] transition-colors shadow-sm"
                        >
                            Guardar
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}