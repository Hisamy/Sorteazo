import { useState } from "react";
import { TopNavBar } from "./util-components/TopNavBar";
import { ProgressBar } from "./util-components/ProgressBar";
import { Paso1InfoBasica } from "./pasos-sorteo/Paso1InfoBasica";
import { Paso2FechasSorteo } from "./pasos-sorteo/Paso2FechasSorteo";
import { Paso3Placeholder } from "./pasos-sorteo/Paso3Placeholder";

export function GestorCrearSorteo() {
    const [currentStep, setCurrentStep] = useState(1);
    const [formData, setFormData] = useState({
        // Aqui la informacion de cada paso que se vaya acumulando
        paso1: {},
        paso2: {},
        paso3: {},
    });

    const totalSteps = 3;

    const handleNext = (stepData) => {
        // Guardar los datos del paso actual
        setFormData(prev => ({
            ...prev,
            [`paso${currentStep}`]: stepData
        }));

        // Continua al siguiente paso
        if (currentStep < totalSteps) {
            setCurrentStep(currentStep + 1);
        }
    };

    const handlePrevious = () => {
        if (currentStep > 1) {
            setCurrentStep(currentStep - 1);
        }
    };

    const handleCancel = () => {
        // Si al final siempre no lo quiere hacer
        if (window.confirm("¿Estás seguro de que deseas cancelar? Se perderán todos los cambios.")) {
            // Resetea todo y regresamos al paso 1, posteriormente seria que nos movamos a la principal
            setCurrentStep(1);
            setFormData({
                paso1: {},
                paso2: {},
                paso3: {},
            });
        }
    };

    const handleSubmit = (finalStepData) => {
        // Juntamos los datos y listo para enviar
        const completeData = {
            ...formData,
            [`paso${currentStep}`]: finalStepData
        };

        console.log("Datos completos del sorteo:", completeData);
        // Aqui estaria la integracion a la API
    };

    // Renderizar el paso actual
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
                return <Paso3Placeholder {...commonProps} />;
            default:
                return <Paso1InfoBasica {...commonProps} />;
        }
    };

    const handleFormSubmit = (e) => {
        e.preventDefault();

        if (currentStep === totalSteps) {
            handleSubmit(formData[`paso${currentStep}`]);
        } else {
            handleNext(formData[`paso${currentStep}`]);
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
                    {/* Contenedor del paso en que vamos */}
                    <div className="bg-white rounded-2xl shadow-lg p-8">
                        <form onSubmit={handleFormSubmit}>
                            {renderStep()}

                            {/* Botones y barra de progreso */}
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
