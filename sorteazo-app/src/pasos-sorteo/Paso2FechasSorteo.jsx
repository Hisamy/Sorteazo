import { InputDate } from "../form-components/InputDate";
import { InputForm } from "../form-components/InputForm";

export function Paso2FechasSorteo({ initialData, errors = {} }) {
    return (
        <>
            <h2 className="text-2xl font-afacad font-semibold text-[var(--color-dark-text)] mb-2">
                Fechas de pago y realización del sorteo
            </h2>
            <p className="text-[var(--color-gray-text)] mb-8 font-afacad">
                Define cuándo inicia y termina la venta de boletos, fechas límite y cuándo se realiza el sorteo
            </p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                <div>
                    <InputDate 
                        label="Inicio de venta:" 
                        name="fechaInicioVenta"
                        defaultValue={initialData?.fechaInicioVenta || ""}
                        error={errors?.fechaInicioVenta}
                    />
                </div>
                <div>
                    <InputDate 
                        label="Fin de venta:" 
                        name="fechaFinVenta"
                        defaultValue={initialData?.fechaFinVenta || ""}
                        error={errors?.fechaFinVenta}
                    />
                </div>
            </div>

            <div className="mb-6">
                <label className="block mb-2 text-[var(--color-primary)] font-semibold font-afacad">
                    Días límite para pagar (1-60):
                </label>
                <InputForm
                    type="number"
                    name="fechaLimitePago"
                    placeholder="Ej. 7"
                    defaultValue={initialData?.fechaLimitePago || ""}
                    error={errors?.fechaLimitePago}
                />
            </div>

            <InputDate 
                label="Fecha de realización sorteo:" 
                name="fechaRealizacionSorteo"
                defaultValue={initialData?.fechaRealizacionSorteo || ""}
                error={errors?.fechaRealizacionSorteo}
            />

            {errors?.general && (
                <p className="text-sm text-red-600 font-afacad mt-2">{errors.general}</p>
            )}
        </>
    );
}
