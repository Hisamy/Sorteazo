import { useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { TopNavBar } from "./util-components/TopNavBar";
import { ProgressBar } from "./util-components/ProgressBar";
import { Paso1InfoBasica } from "./pasos-sorteo/Paso1InfoBasica";
import { Paso2FechasSorteo } from "./pasos-sorteo/Paso2FechasSorteo";
import { Paso3Placeholder } from "./pasos-sorteo/Paso3Placeholder";
import { Paso4Resumen } from "./pasos-sorteo/Paso4Resumen";
import { crearSorteo } from './controllers/SorteoController.js';

export function GestorCrearSorteo() {
    const navigate = useNavigate();
    const [currentStep, setCurrentStep] = useState(1);
    const [formData, setFormData] = useState({
        paso1: {},
        paso2: {},
        paso3: {},
        paso4: {},
    });
    const [errors, setErrors] = useState({
        paso1: {},
        paso2: {},
        paso3: {},
        paso4: {},
    });
    const formRef = useRef(null);
    const paso3Ref = useRef(null);

    const totalSteps = 4;

    // Función para extraer datos del formulario
    const extractFormData = () => {
        if (!formRef.current) return {};
        
        const formDataObj = new FormData(formRef.current);
        const data = {};
        
        for (let [key, value] of formDataObj.entries()) {
            data[key] = value;
        }
        
        return data;
    };

    const sanitizeText = (value = "") => value?.toString().trim();

    const hasAnyErrors = (value) => {
        if (!value) return false;
        if (typeof value === 'string') {
            return value.trim().length > 0;
        }
        if (Array.isArray(value)) {
            return value.some((item) => hasAnyErrors(item));
        }
        if (typeof value === 'object') {
            return Object.values(value).some((item) => hasAnyErrors(item));
        }
        return Boolean(value);
    };

    const validatePaso1 = (data = {}) => {
        const stepErrors = {};
        const titulo = sanitizeText(data.titulo);
        const descripcion = sanitizeText(data.descripcion);
        const cantidadBoletosRaw = data.cantidadBoletos;
        const inicioNumeracionRaw = data.inicioNumeracion;
        const precioBoletoRaw = data.precioBoleto;
        const cantidadBoletos = Number(cantidadBoletosRaw);
        const inicioNumeracion = Number(inicioNumeracionRaw);
        const precioBoleto = Number(precioBoletoRaw);
        const disallowedPattern = /<\s*\/?\s*script|[<>]/i;

        if (!titulo) {
            stepErrors.titulo = "El título es obligatorio.";
        } else if (titulo.length < 5) {
            stepErrors.titulo = "Debe tener al menos 5 caracteres.";
        } else if (titulo.length > 100) {
            stepErrors.titulo = "El título no puede exceder 100 caracteres.";
        } else if (disallowedPattern.test(titulo)) {
            stepErrors.titulo = "El título contiene caracteres no permitidos.";
        }

        if (!descripcion) {
            stepErrors.descripcion = "La descripción es obligatoria.";
        } else if (descripcion.length < 10) {
            stepErrors.descripcion = "Debe tener al menos 10 caracteres.";
        } else if (descripcion.length > 2000) {
            stepErrors.descripcion = "La descripción no puede exceder 2000 caracteres.";
        }

        if (cantidadBoletosRaw === undefined || cantidadBoletosRaw === null || `${cantidadBoletosRaw}`.trim() === "") {
            stepErrors.cantidadBoletos = "Ingresa la cantidad de boletos.";
        } else if (!Number.isInteger(cantidadBoletos)) {
            stepErrors.cantidadBoletos = "Ingresa un número entero válido.";
        } else if (cantidadBoletos < 1 || cantidadBoletos > 1000) {
            stepErrors.cantidadBoletos = "Debe estar entre 1 y 1,000.";
        }

        if (inicioNumeracionRaw === undefined || inicioNumeracionRaw === null || `${inicioNumeracionRaw}`.trim() === "") {
            stepErrors.inicioNumeracion = "Indica el numero desde el que comienza la numeración.";
        } else if (!Number.isInteger(inicioNumeracion) || inicioNumeracion < 0) {
            stepErrors.inicioNumeracion = "Ingresa un entero mayor o igual a 0.";
        } else if (inicioNumeracion > 9999) {
            stepErrors.inicioNumeracion = "El valor inicial no puede exceder 9,999.";
        }

        if (precioBoletoRaw === undefined || precioBoletoRaw === null || `${precioBoletoRaw}`.trim() === "") {
            stepErrors.precioBoleto = "Ingresa el precio por boleto.";
        } else if (Number.isNaN(precioBoleto)) {
            stepErrors.precioBoleto = "Ingresa un precio válido.";
        } else if (precioBoleto < 10 || precioBoleto > 50000) {
            stepErrors.precioBoleto = "El precio debe estar entre 10 y 50,000.";
        }

        const imagenSorteo = data.imagenSorteo;
        const imagenUrl = sanitizeText(data.imagenUrl);
        const hasUploadedImage = imagenSorteo instanceof File && imagenSorteo.size > 0;
        const hasStoredImage = Boolean(imagenUrl);

        if (!hasUploadedImage && !hasStoredImage) {
            stepErrors.imagenSorteo = "La imagen es obligatoria.";
        }

        return stepErrors;
    };

    const parseDateInput = (value) => {
        if (!value || typeof value !== 'string') return null;
        const [year, month, day] = value.split('-').map(Number);
        if ([year, month, day].some((part) => Number.isNaN(part))) {
            return null;
        }
        const parsed = new Date(year, month - 1, day);
        parsed.setHours(0, 0, 0, 0);
        return parsed;
    };

    const formatDateToISO = (date) => {
        if (!(date instanceof Date) || Number.isNaN(date.getTime())) {
            return null;
        }
        const year = date.getFullYear();
        const month = `${date.getMonth() + 1}`.padStart(2, '0');
        const day = `${date.getDate()}`.padStart(2, '0');
        return `${year}-${month}-${day}`;
    };

    const validatePaso2 = (data = {}) => {
        const stepErrors = {};
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        const fechaInicio = parseDateInput(data.fechaInicioVenta);
        const fechaFin = parseDateInput(data.fechaFinVenta);
        const fechaSorteo = parseDateInput(data.fechaRealizacionSorteo);
        const diasLimite = Number(data.fechaLimitePago);

        if (!fechaInicio) {
            stepErrors.fechaInicioVenta = "Selecciona una fecha válida.";
        } else if (fechaInicio < today) {
            stepErrors.fechaInicioVenta = "La venta debe iniciar hoy o después.";
        }

        if (!fechaFin) {
            stepErrors.fechaFinVenta = "Selecciona una fecha válida.";
        } else if (fechaInicio && fechaFin <= fechaInicio) {
            stepErrors.fechaFinVenta = "Debe ser posterior al inicio de venta.";
        }

        if (!fechaSorteo) {
            stepErrors.fechaRealizacionSorteo = "Selecciona una fecha válida.";
        } else if (fechaFin && fechaSorteo < fechaFin) {
            stepErrors.fechaRealizacionSorteo = "Debe ser igual o posterior al fin de venta.";
        }

        if (!Number.isInteger(diasLimite)) {
            stepErrors.fechaLimitePago = "Ingresa un número entero.";
        } else if (diasLimite < 1 || diasLimite > 60) {
            stepErrors.fechaLimitePago = "El rango permitido es entre 1 y 60 días.";
        }

        if (!stepErrors.fechaInicioVenta && !stepErrors.fechaFinVenta && !stepErrors.fechaRealizacionSorteo) {
            if (fechaInicio && fechaFin && fechaSorteo && !(fechaInicio < fechaFin && fechaSorteo >= fechaFin)) {
                stepErrors.general = "Verifica el orden cronológico de las fechas.";
            }
        }

        return stepErrors;
    };

    const validatePaso3 = (data = {}) => {
        const stepErrors = {};
        const prizes = Array.isArray(data?.premios) ? data.premios : Array.isArray(data?.prizes) ? data.prizes : [];

        if (!prizes.length) {
            stepErrors.general = "Agrega al menos un premio.";
            return stepErrors;
        }

        const placeUsage = new Map();
        const prizeErrors = [];
        const allowedTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/jpg'];
        const maxSize = 5 * 1024 * 1024;
        const totalPrizes = prizes.length;

        prizes.forEach((prize, index) => {
            const currentErrors = {};
            const name = sanitizeText(prize.name);
            const description = sanitizeText(prize.description);
            const place = Number(prize.place);
            const hasImage = prize.imageFile instanceof File || Boolean(prize.imageUrl);

            if (!name) {
                currentErrors.name = "El nombre es obligatorio.";
            } else if (name.length > 100) {
                currentErrors.name = "Máximo 100 caracteres.";
            }

            if (!description) {
                currentErrors.description = "La descripción es obligatoria.";
            } else if (description.length > 500) {
                currentErrors.description = "Máximo 500 caracteres.";
            }

            if (!Number.isInteger(place) || place <= 0) {
                currentErrors.place = "Ingresa un entero positivo.";
            } else {
                if (totalPrizes === 1 && place !== 1) {
                    currentErrors.place = "Si solo hay un premio, el lugar debe ser 1.";
                } else if (place > totalPrizes) {
                    currentErrors.place = `El lugar no puede ser mayor al número total de premios (${totalPrizes}).`;
                } else {
                    const indexes = placeUsage.get(place) || [];
                    placeUsage.set(place, [...indexes, index]);
                }
            }

            if (!hasImage) {
                currentErrors.imageFile = "La imagen del premio es obligatoria.";
            } else if (prize.imageFile instanceof File) {
                if (!allowedTypes.includes(prize.imageFile.type)) {
                    currentErrors.imageFile = "Formato inválido. Usa JPG, PNG o WEBP.";
                } else if (prize.imageFile.size > maxSize) {
                    currentErrors.imageFile = "La imagen debe pesar menos de 5 MB.";
                }
            }

            if (Object.keys(currentErrors).length > 0) {
                prizeErrors[index] = currentErrors;
            }
        });

        placeUsage.forEach((indexes, placeNumber) => {
            if (indexes.length > 1) {
                indexes.forEach((i) => {
                    prizeErrors[i] = {
                        ...(prizeErrors[i] || {}),
                        place: "Cada premio debe tener un lugar único."
                    };
                });
            }
        });

        if (!placeUsage.has(1)) {
            stepErrors.general = stepErrors.general || "Debe existir un premio para el primer lugar.";
        }

        if (prizeErrors.some(Boolean)) {
            stepErrors.premios = prizeErrors;
        }

        return stepErrors;
    };

    const validateStep = (stepNumber, data) => {
        let stepErrors = {};
        switch (stepNumber) {
            case 1:
                stepErrors = validatePaso1(data);
                break;
            case 2:
                stepErrors = validatePaso2(data);
                break;
            case 3:
                stepErrors = validatePaso3(data);
                break;
            default:
                stepErrors = {};
        }

        setErrors(prev => ({
            ...prev,
            [`paso${stepNumber}`]: stepErrors
        }));

        return !hasAnyErrors(stepErrors);
    };

    const handleNext = () => {
        const stepData = extractFormData();
        
        if (currentStep === 3 && paso3Ref.current) {
            stepData.premios = paso3Ref.current.getPrizes();
        }

        if (!validateStep(currentStep, stepData)) {
            return;
        }
        
        setFormData(prev => ({
            ...prev,
            [`paso${currentStep}`]: stepData
        }));

        if (currentStep < totalSteps) {
            setCurrentStep(currentStep + 1);
        }
    };

    const handlePrevious = () => {
        const stepData = extractFormData();
        if (currentStep === 3 && paso3Ref.current) {
            stepData.premios = paso3Ref.current.getPrizes();
        }
        
        setFormData(prev => ({
            ...prev,
            [`paso${currentStep}`]: stepData
        }));

        if (currentStep > 1) {
            setCurrentStep(currentStep - 1);
        }
    };

    const handleCancel = () => {
        if (window.confirm("¿Estás seguro de que deseas cancelar? Se perderán todos los cambios.")) {
            setCurrentStep(1);
            setFormData({
                paso1: {},
                paso2: {},
                paso3: {},
                paso4: {},
            });
            setErrors({
                paso1: {},
                paso2: {},
                paso3: {},
                paso4: {},
            });
        }
    };

    const handleSubmit = async () => {
        const finalStepData = extractFormData();
        
        if (currentStep === 3 && paso3Ref.current) {
            finalStepData.premios = paso3Ref.current.getPrizes();
        }

        const completeData = {
            ...formData,
            [`paso${currentStep}`]: finalStepData
        };

        const firstInvalidStep = [1, 2, 3].find(step => !validateStep(step, completeData[`paso${step}`]));
        if (firstInvalidStep) {
            setCurrentStep(firstInvalidStep);
            return;
        }
        
        const { paso1, paso2, paso3 } = completeData;
        const formDataToSend = new FormData();

        formDataToSend.append('title', paso1.titulo);
        formDataToSend.append('ticketPrice', parseFloat(paso1.precioBoleto));
        formDataToSend.append('numbersQuantity', parseInt(paso1.cantidadBoletos));
        formDataToSend.append('startNumber', parseInt(paso1.inicioNumeracion));
        formDataToSend.append('description', paso1.descripcion);

        const saleStartDate = parseDateInput(paso2.fechaInicioVenta);
        const diasLimite = Number(paso2.fechaLimitePago);
        let paymentDeadlineDate = null;
        if (saleStartDate && Number.isInteger(diasLimite)) {
            paymentDeadlineDate = new Date(saleStartDate);
            paymentDeadlineDate.setDate(paymentDeadlineDate.getDate() + diasLimite);
        }
        const paymentDeadlineIso = formatDateToISO(paymentDeadlineDate);
        if (!paymentDeadlineIso) {
            alert("No se pudo calcular la fecha límite de pago. Revisa los datos del paso 2.");
            setCurrentStep(2);
            return;
        }

        formDataToSend.append('paymentDeadline', paymentDeadlineIso);
        formDataToSend.append('saleStartDate', paso2.fechaInicioVenta);
        formDataToSend.append('saleEndDate', paso2.fechaFinVenta);
        formDataToSend.append('raffleDateTime', paso2.fechaRealizacionSorteo);

        if (paso1.imagenSorteo instanceof File) {
            formDataToSend.append('imagenSorteo', paso1.imagenSorteo);
        } else if (paso1.imagenUrl) {
            formDataToSend.append('imageUrl', paso1.imagenUrl);
        }

        const premios = (paso3.premios || [])
            .filter(p => p.name && p.name.trim() !== '')
            .map(({ name, place, description }) => ({
                name: name.trim(),
                place: parseInt(place),
                description: description || '',
                imageUrl: ''
            }));

        formDataToSend.append('premios', JSON.stringify(premios));

        (paso3.premios || []).forEach(({ imageFile }) => {
            if (imageFile instanceof File) {
                formDataToSend.append('imagenesPremios', imageFile);
            }
        });
        
        try {
            await crearSorteo(formDataToSend);
            
            alert("¡Sorteo creado exitosamente!");
            navigate('/sorteos/organizador');
        } catch (error) {
            console.error("Error al crear sorteo:", error);
            alert(error.response?.data?.message || error.message || "Hubo un error al crear el sorteo. Por favor intenta de nuevo.");
        }
    };

    const renderStep = () => {
        switch (currentStep) {
            case 1:
                return (
                    <Paso1InfoBasica
                        initialData={formData.paso1}
                        errors={errors.paso1}
                    />
                );
            case 2:
                return (
                    <Paso2FechasSorteo
                        initialData={formData.paso2}
                        errors={errors.paso2}
                    />
                );
            case 3:
                return (
                    <Paso3Placeholder
                        initialData={formData.paso3}
                        errors={errors.paso3}
                        ref={paso3Ref}
                    />
                );
            case 4:
                return <Paso4Resumen data={formData} />;
            default:
                return (
                    <Paso1InfoBasica
                        initialData={formData.paso1}
                        errors={errors.paso1}
                    />
                );
        }
    };

    const handleFormSubmit = (e) => {
        e.preventDefault();

        if (currentStep === totalSteps) {
            handleSubmit();
        } else {
            handleNext();
        }
    };

    return (
        <div className="min-h-screen bg-[var(--color-background)]">
            <TopNavBar />

            <div className="container mx-auto px-4 py-8">
                <h1 className="text-4xl font-afacad font-bold text-center text-[var(--color-dark-text)] mb-2">
                    Crear nuevo Sorteo
                </h1>

                <div className="max-w-4xl mx-auto">
                    <div className="bg-white rounded-2xl shadow-lg p-8">
                        <form ref={formRef} onSubmit={handleFormSubmit}>
                            {renderStep()}

                            <div className="mt-8 pt-6 border-t border-[var(--color-light-gray)] flex items-center justify-between">


                                <div className="flex-shrink-0">
                                    <ProgressBar
                                        currentStep={currentStep}
                                        totalSteps={totalSteps}
                                        stepLabel={`Paso ${currentStep} de ${totalSteps}`}
                                    />
                                </div>

                                <div className="flex gap-4">
                                    {currentStep === 1 ? (
                                        <button
                                            type="button"
                                            onClick={handleCancel}
                                            className="px-8 py-2 rounded-xl border-2 border-[var(--color-light-gray)] text-[var(--color-dark-text)] font-afacad font-semibold hover:bg-[var(--color-light-gray)] transition-colors duration-300"
                                        >
                                            Cancelar
                                        </button>
                                    ) : (
                                        <button
                                            type="button"
                                            onClick={handlePrevious}
                                            className="px-8 py-2 rounded-xl border-2 border-[var(--color-light-gray)] text-[var(--color-dark-text)] font-afacad font-semibold hover:bg-[var(--color-light-gray)] transition-colors duration-300"
                                        >
                                            Anterior
                                        </button>
                                    )}
                                    <button
                                        type="submit"
                                        className="px-8 py-2 rounded-xl bg-[var(--color-primary)] text-[var(--color-light-text)] font-afacad font-semibold hover:bg-[var(--color-primary-hover)] transition-colors duration-300"
                                    >
                                        {currentStep === totalSteps ? 'Crear Sorteo' : 'Siguiente'}
                                    </button>
                                </div>

                            </div>
                        </form>
                    </div>
                </div>
            </div>
        </div>
    );
}
