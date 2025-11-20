import { InputDate } from "../form-components/InputDate";

export function Paso2FechasSorteo({ initialData }) {
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
                        required
                    />
                </div>
                <div>
                    <InputDate 
                        label="Fin de venta:" 
                        name="fechaFinVenta"
                        defaultValue={initialData?.fechaFinVenta || ""}
                        required
                    />
                </div>
            </div>

            <InputDate 
                label="Fecha límite de pago del sorteo:" 
                name="fechaLimitePago"
                defaultValue={initialData?.fechaLimitePago || ""}
                required
            />

            <InputDate 
                label="Fecha de realización sorteo:" 
                name="fechaRealizacionSorteo"
                defaultValue={initialData?.fechaRealizacionSorteo || ""}
                required
            />
        </>
    );
}
