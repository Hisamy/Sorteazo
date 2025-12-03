import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Swal from 'sweetalert2';
import { CardPremio } from '../form-components/CardPremio.jsx';
import { FaGift, FaPlus } from "react-icons/fa";
import { obtenerSorteoId } from '../controllers/SorteoController.js';
import { editaPremiosSorteo } from '../controllers/SorteoController.js';

export function EditarSorteoPremios() {
    const { id } = useParams();
    const navigate = useNavigate();

    const [prizes, setPrizes] = useState([]);
    const [sorteoTitle, setSorteoTitle] = useState("");
    const [loading, setLoading] = useState(true);
    const [errors, setErrors] = useState({});

    useEffect(() => {
        const cargarDatos = async () => {
            try {
                const data = await obtenerSorteoId(id);
                console.log("Datos cargados completos:", data);
                console.log("Premios del backend:", data.prizes);

                setSorteoTitle(data.title || "Sorteo sin título");

                // Verificar diferentes posibles nombres de campos
                const premiosBackend = data.prizes || data.premios || [];

                console.log("Premios a mapear:", premiosBackend);

                if (premiosBackend && premiosBackend.length > 0) {
                    const premiosMapeados = premiosBackend.map((premio, index) => {
                        console.log(`Premio ${index}:`, premio);

                        return {
                            id: premio.id || premio._id || Date.now() + index,
                            name: premio.name || premio.nombre || premio.title || '',
                            place: premio.place || premio.lugar || premio.position || index + 1,
                            description: premio.description || premio.descripcion || '',
                            imageFile: null,
                            imageUrl: premio.imageUrl || premio.imagenUrl || premio.imagen || premio.image || null
                        };
                    });

                    console.log("Premios mapeados:", premiosMapeados);
                    setPrizes(premiosMapeados);
                } else {
                    console.log("No se encontraron premios, iniciando con uno vacío");
                    // Si no hay premios, iniciar con uno vacío
                    setPrizes([{
                        id: Date.now(),
                        name: '',
                        place: 1,
                        description: '',
                        imageFile: null,
                        imageUrl: null
                    }]);
                }

                setLoading(false);
            } catch (error) {
                console.error("Error cargando premios", error);
                console.error("Detalles del error:", error.response?.data);
                Swal.fire({
                    icon: 'error',
                    title: 'Error',
                    text: 'No se pudieron cargar los premios del sorteo.'
                });
                setLoading(false);
            }
        };
        cargarDatos();
    }, [id]);


    const handleImageChange = (index, event) => {
        const file = event.target.files[0];
        if (!file) return;

        const maxSize = 5 * 1024 * 1024; // 5MB

        if (file.size > maxSize) {
            Swal.fire({
                icon: "warning",
                title: "Imagen demasiado pesada",
                text: "La imagen es demasiado pesada. El máximo permitido es 5 MB."
            });
            return;
        }

        const newPrizes = [...prizes];
        newPrizes[index].imageFile = file;
        newPrizes[index].imageUrl = URL.createObjectURL(file);
        setPrizes(newPrizes);
    };

    const handleAddPrize = () => {
        const newPrize = {
            id: Date.now(), // ID temporal para premios nuevos
            name: '',
            place: prizes.length + 1,
            description: '',
            imageFile: null,
            imageUrl: null
        };
        setPrizes([...prizes, newPrize]);
    };

    const handleChangePrize = (index, event) => {
        const { name, value } = event.target;
        const newPrizes = [...prizes];
        newPrizes[index][name] = value;
        setPrizes(newPrizes);

        // Limpiar errores si el usuario escribe
        if (errors?.premios?.[index]?.[name]) {
            const newErrors = { ...errors };
            delete newErrors.premios[index][name];
            setErrors(newErrors);
        }
    };

    const handleRemovePrize = (indexToRemove) => {
        if (prizes.length > 1) {
            Swal.fire({
                title: '¿Eliminar premio?',
                text: "Esta acción quitará el premio de la lista.",
                icon: 'warning',
                showCancelButton: true,
                confirmButtonColor: '#d33',
                cancelButtonColor: '#3085d6',
                confirmButtonText: 'Sí, eliminar',
                cancelButtonText: 'Cancelar'
            }).then((result) => {
                if (result.isConfirmed) {
                    const nuevosPremios = prizes.filter((_, index) => index !== indexToRemove);
                    // Re-ajustar los "lugares" (1er lugar, 2do lugar...)
                    const premiosReordenados = nuevosPremios.map((p, i) => ({ ...p, place: i + 1 }));
                    setPrizes(premiosReordenados);
                }
            });
        } else {
            Swal.fire("Atención", "Debe haber al menos un premio en el sorteo.", "info");
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        // Validación básica antes de enviar
        const nuevosErrores = {};
        let hayErrores = false;

        prizes.forEach((premio, index) => {
            if (!premio.name.trim()) {
                if (!nuevosErrores.premios) nuevosErrores.premios = {};
                if (!nuevosErrores.premios[index]) nuevosErrores.premios[index] = {};
                nuevosErrores.premios[index].name = "El nombre es obligatorio";
                hayErrores = true;
            }
        });

        if (hayErrores) {
            setErrors(nuevosErrores);
            Swal.fire("Error", "Por favor completa los campos requeridos.", "error");
            return;
        }

        const result = await Swal.fire({
            title: '¿Guardar cambios?',
            text: `Se actualizarán los premios del sorteo "${sorteoTitle}".`,
            icon: 'question',
            showCancelButton: true,
            confirmButtonColor: '#6B8E78',
            cancelButtonColor: '#d33',
            confirmButtonText: 'Sí, guardar',
            cancelButtonText: 'Cancelar'
        });

        if (result.isConfirmed) {
            try {
                // Preparar datos para enviar
                const premiosData = {
                    premios: prizes
                };

                console.log("Enviando premios al backend:", premiosData);

                await editaPremiosSorteo(id, premiosData);

                await Swal.fire({
                    title: '¡Guardado!',
                    text: 'Los premios han sido actualizados correctamente.',
                    icon: 'success',
                    confirmButtonColor: '#6B8E78'
                });

                navigate(-1); // Volver
            } catch (error) {
                console.error("Error guardando premios:", error);
                Swal.fire({
                    icon: 'error',
                    title: 'Error',
                    text: error.response?.data?.message || 'No se pudieron guardar los premios. Intenta de nuevo.'
                });
            }
        }
    };

    if (loading) {
        return (
            <div className="p-10 text-center font-afacad">
                <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-[var(--color-primary)]"></div>
                <p className="mt-4">Cargando premios...</p>
            </div>
        );
    }

    return (
        <div className="bg-[var(--color-background)] min-h-screen p-8">
            <div className="bg-white p-8 rounded-lg shadow-sm max-w-4xl mx-auto border border-gray-100">

                {/* Header */}
                <div className="mb-6 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                    <div>
                        <div className="flex items-center gap-3">
                            <div className="p-3 bg-yellow-100 text-yellow-600 rounded-full">
                                <FaGift size={24} />
                            </div>
                            <h2 className="text-3xl font-afacad font-bold text-[var(--color-dark-text)]">
                                Editar Premios
                            </h2>
                        </div>
                        <p className="text-[var(--color-gray-text)] font-afacad text-sm ml-14">
                            Agrega, elimina o modifica los premios del sorteo "{sorteoTitle}".
                        </p>
                    </div>

                    {/* Botón Agregar */}
                    <button
                        type="button"
                        onClick={handleAddPrize}
                        className="flex items-center gap-2 px-5 py-2.5 bg-[var(--color-primary)] text-white rounded-xl font-afacad font-semibold hover:bg-[var(--color-primary-hover)] transition-colors duration-300 shadow-sm"
                    >
                        <FaPlus />
                        <span>Agregar premio</span>
                    </button>
                </div>

                <form onSubmit={handleSubmit}>
                    {/* Lista de Premios */}
                    <div className="space-y-6 mb-8">
                        {prizes.length > 0 ? (
                            prizes.map((prize, index) => (
                                <CardPremio
                                    key={prize.id}
                                    index={index}
                                    prize={prize}
                                    totalPrizes={prizes.length}
                                    handleChange={handleChangePrize}
                                    handleImageChange={handleImageChange}
                                    handleRemove={handleRemovePrize}
                                    errors={errors?.premios?.[index]}
                                />
                            ))
                        ) : (
                            <div className="text-center p-8 text-gray-500 font-afacad">
                                No hay premios configurados. Haz clic en "Agregar premio" para comenzar.
                            </div>
                        )}
                    </div>

                    {/* Footer Actions */}
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
                            Guardar
                        </button>
                    </div>
                </form>

            </div>
        </div>
    );
}