import { InputForm } from "../form-components/InputForm";
import { TextAreaForm } from "../form-components/TextAreaForm";
import "../form-components/Paso1InfoBasica.css";

export function Paso1InfoBasica({ initialData }) {
    return (
        <div className="paso1-container">
            <h2 className="paso1-titulo">Información del sorteo</h2>
            <p className="paso1-descripcion">
                Completa el formulario con la información básica para la creación de tu nuevo sorteo.
            </p>

            <div className="form-grid">
                <InputForm
                    label="Título del Sorteo:"placeholder="Ej. Sorteo San Valentín"
                    name="titulo"
                    defaultValue={initialData?.titulo || ""}
                />

                <div className="form-grid-doble">
                    <InputForm
                        label="Cantidad de boletos (1-1000):"type="number"placeholder="Ej. 100"
                        name="cantidadBoletos"
                        defaultValue={initialData?.cantidadBoletos || ""}
                    />
                    <InputForm
                        label="Iniciar numeración desde:"type="number" placeholder="Ej. 1"
                        name="inicioNumeracion"
                        defaultValue={initialData?.inicioNumeracion || ""}
                    />
                </div>

                <InputForm
                        label="Precio del boleto:"type="number" placeholder="Ej. 50.00"
                        name="precioBoleto"
                        step="0.01"
                        min="0"
                        defaultValue={initialData?.precioBoleto || ""}
            />
               

                <TextAreaForm
                    label="Descripción:"placeholder="Describe los detalles de tu sorteo."
                    name="descripcion"
                    defaultValue={initialData?.descripcion || ""}
                />

                <div className="file-input-container">
                    <label className="file-label">Imagen:</label>
                    <input
                        type="file"
                        name="imagen"
                        accept="image/*"
                        className="file-input"
                    />
                </div>
            </div>
        </div>
    );
}
