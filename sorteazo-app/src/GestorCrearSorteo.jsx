import { useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { TopNavBar } from "./util-components/TopNavBar";
import { ProgressBar } from "./util-components/ProgressBar";
import { Paso1InfoBasica } from "./pasos-sorteo/Paso1InfoBasica";
import { Paso2FechasSorteo } from "./pasos-sorteo/Paso2FechasSorteo";
import { Paso3Placeholder } from "./pasos-sorteo/Paso3Placeholder";

export function GestorCrearSorteo() {
    const navigate = useNavigate();
    const [currentStep, setCurrentStep] = useState(1);
    const [formData, setFormData] = useState({
        paso1: {},
        paso2: {},
        paso3: {},
    });
    const formRef = useRef(null);
    const paso3Ref = useRef(null);

    const totalSteps = 3;

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

    const handleNext = () => {
        const stepData = extractFormData();
        
        if (currentStep === 3 && paso3Ref.current) {
            stepData.premios = paso3Ref.current.getPrizes();
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
        
        const { paso1, paso2, paso3 } = completeData;
        const formDataToSend = new FormData();

        formDataToSend.append('title', paso1.titulo);
        formDataToSend.append('ticketPrice', parseFloat(paso1.precioBoleto));
        formDataToSend.append('numbersQuantity', parseInt(paso1.cantidadBoletos));
        formDataToSend.append('startNumber', parseInt(paso1.inicioNumeracion));
        formDataToSend.append('description', paso1.descripcion);
        formDataToSend.append('paymentDeadline', paso2.fechaLimitePago);
        formDataToSend.append('saleStartDate', paso2.fechaInicioVenta);
        formDataToSend.append('saleEndDate', paso2.fechaFinVenta);
        formDataToSend.append('raffleDateTime', paso2.fechaRealizacionSorteo);

        if (paso1.imagenSorteo instanceof File) {
            formDataToSend.append('imagenSorteo', paso1.imagenSorteo);
        } else if (paso1.imagenUrl) {
            formDataToSend.append('imageUrl', paso1.imagenUrl);
        }

        const premios = (paso3.premios || []).map(({ name, place, description }) => ({
            name,
            place: parseInt(place),
            description,
            imageUrl: ''
        }));

        formDataToSend.append('premios', JSON.stringify(premios));

        (paso3.premios || []).forEach(({ imageFile }) => {
            if (imageFile instanceof File) {
                formDataToSend.append('imagenesPremios', imageFile);
            }
        });
        
        try {
            const { crearSorteo } = await import('./controllers/SorteoController.js');
            await crearSorteo(formDataToSend);
            
            alert("¡Sorteo creado exitosamente!");
            navigate('/dashboard-organizador');
        } catch (error) {
            console.error("Error al crear sorteo:", error);
            alert(error.response?.data?.message || error.message || "Hubo un error al crear el sorteo. Por favor intenta de nuevo.");
        }
    };

    const renderStep = () => {
        const commonProps = {
            initialData: formData[`paso${currentStep}`],
        };

        switch (currentStep) {
            case 1:
                return <Paso1InfoBasica {...commonProps} />;
            case 2:
                return <Paso2FechasSorteo {...commonProps} />;
            case 3:
                return <Paso3Placeholder {...commonProps} ref={paso3Ref} />;
            default:
                return <Paso1InfoBasica {...commonProps} />;
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
