import { InputForm } from "../form-components/InputForm";
import { TextAreaForm } from "../form-components/TextAreaForm";

export function Paso1InfoBasica({ initialData }) {
    return (
        <>
            <h2 className="text-2xl font-afacad font-semibold text-[var(--color-dark-text)] mb-2">
                Información del sorteo
            </h2>
            <p className="text-[var(--color-gray-text)] mb-8 font-afacad">
                Completa el formulario con la información básica para la creación de tu nuevo sorteo.
            </p>

            <div className="grid grid-cols-1 gap-6 mb-6">
                <div>
                    <label className="block mb-2 text-[var(--color-dark-text)] font-semibold font-afacad">
                        Título del Sorteo:
                    </label>
                    <InputForm
                        placeholder="Ej. Sorteo San Valentín"
                        name="titulo"
                        defaultValue={initialData?.titulo || ""}
                    />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                        <label className="block mb-2 text-[var(--color-dark-text)] font-semibold font-afacad">
                            Cantidad de boletos (1-1000):
                        </label>
                        <InputForm
                            type="number"
                            placeholder="Ej. 100"
                            name="cantidadBoletos"
                            defaultValue={initialData?.cantidadBoletos || ""}
                        />
                    </div>
                    <div>
                        <label className="block mb-2 text-[var(--color-dark-text)] font-semibold font-afacad">
                            Iniciar numeración desde:
                        </label>
                        <InputForm
                            type="number"
                            placeholder="Ej. 1"
                            name="inicioNumeracion"
                            defaultValue={initialData?.inicioNumeracion || ""}
                        />
                    </div>
                </div>

                <div>
                    <label className="block mb-2 text-[var(--color-dark-text)] font-semibold font-afacad">
                        Precio del boleto:
                    </label>
                    <InputForm
                        type="number"
                        placeholder="Ej. 50.00"
                        name="precioBoleto"
                        step="0.01"
                        min="0"
                        defaultValue={initialData?.precioBoleto || ""}
                    />
                </div>

                <div>
                    <label className="block mb-2 text-[var(--color-dark-text)] font-semibold font-afacad">
                        Descripción:
                    </label>
                    <TextAreaForm
                        placeholder="Describe los detalles de tu sorteo."
                        name="descripcion"
                        defaultValue={initialData?.descripcion || ""}
                    />
                </div>

                <div>
                    <label className="block mb-2 text-[var(--color-dark-text)] font-semibold font-afacad">
                        Imagen:
                    </label>
                    <input
                        type="file"
                        name="imagen"
                        accept="image/*"
                        className="w-full border border-[var(--color-light-gray)] rounded-xl px-4 py-2 text-[var(--color-dark-text)] file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-[var(--color-light-gray)] file:text-[var(--color-dark-text)] hover:file:bg-[var(--color-gray-text)] hover:file:text-white focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)] focus:border-transparent transition-all duration-200"
                    />
                </div>
            </div>
        </>
    );
}
