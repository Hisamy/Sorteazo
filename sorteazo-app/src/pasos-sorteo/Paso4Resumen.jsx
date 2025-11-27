export function Paso4Resumen({ data }) {
    const paso1 = data?.paso1 || {};
    const paso2 = data?.paso2 || {};
    const paso3 = data?.paso3 || {};
    const premios = Array.isArray(paso3?.premios) ? paso3.premios : [];
    const totalPremios = premios.length;
    const premiosOrdenados = [...premios].sort((a, b) => {
        const placeA = Number(a?.place) || 0;
        const placeB = Number(b?.place) || 0;
        return placeA - placeB;
    });

    const formatDate = (value) => {
        if (!value) return "—";
        const date = new Date(value);
        if (Number.isNaN(date.getTime())) return value;
        return date.toLocaleDateString("es-MX", {
            year: "numeric",
            month: "long",
            day: "numeric"
        });
    };

    const formatCurrency = (value) => {
        const amount = Number(value);
        if (Number.isNaN(amount)) return "—";
        return amount.toLocaleString("es-MX", {
            style: "currency",
            currency: "MXN",
            minimumFractionDigits: 2
        });
    };

    return (
        <div>
            <h2 className="text-2xl font-afacad font-semibold text-[var(--color-dark-text)] mb-2">
                Revisión final
            </h2>
            <p className="text-[var(--color-gray-text)] mb-8 font-afacad">
                Confirma toda la información antes de crear tu sorteo. Si necesitas ajustes, vuelve al paso correspondiente.
            </p>

            <div className="space-y-6">
                <section className="bg-white border border-[var(--color-light-gray)] rounded-2xl p-6">
                    <h3 className="text-xl font-afacad font-semibold text-[var(--color-primary)] mb-4">
                        Información básica
                    </h3>
                    <dl className="grid grid-cols-1 md:grid-cols-2 gap-4 text-[var(--color-dark-text)]">
                        <div>
                            <dt className="font-semibold">Título</dt>
                            <dd>{paso1.titulo || "—"}</dd>
                        </div>
                        <div>
                            <dt className="font-semibold">Precio del boleto</dt>
                            <dd>{formatCurrency(paso1.precioBoleto)}</dd>
                        </div>
                        <div>
                            <dt className="font-semibold">Cantidad de boletos</dt>
                            <dd>{paso1.cantidadBoletos || "—"}</dd>
                        </div>
                        <div>
                            <dt className="font-semibold">Inicio numeración</dt>
                            <dd>{paso1.inicioNumeracion || "—"}</dd>
                        </div>
                        <div className="md:col-span-2">
                            <dt className="font-semibold">Descripción</dt>
                            <dd className="text-[var(--color-gray-text)]">{paso1.descripcion || "—"}</dd>
                        </div>
                    </dl>
                </section>

                <section className="bg-white border border-[var(--color-light-gray)] rounded-2xl p-6">
                    <h3 className="text-xl font-afacad font-semibold text-[var(--color-primary)] mb-4">
                        Fechas y pagos
                    </h3>
                    <dl className="grid grid-cols-1 md:grid-cols-2 gap-4 text-[var(--color-dark-text)]">
                        <div>
                            <dt className="font-semibold">Inicio de venta</dt>
                            <dd>{formatDate(paso2.fechaInicioVenta)}</dd>
                        </div>
                        <div>
                            <dt className="font-semibold">Fin de venta</dt>
                            <dd>{formatDate(paso2.fechaFinVenta)}</dd>
                        </div>
                        <div>
                            <dt className="font-semibold">Fecha del sorteo</dt>
                            <dd>{formatDate(paso2.fechaRealizacionSorteo)}</dd>
                        </div>
                        <div>
                            <dt className="font-semibold">Días límite de pago</dt>
                            <dd>{paso2.fechaLimitePago ? `${paso2.fechaLimitePago} días` : "—"}</dd>
                        </div>
                    </dl>
                </section>

                <section className="bg-white border border-[var(--color-light-gray)] rounded-2xl p-6">
                    <div className="flex items-center justify-between mb-4">
                        <h3 className="text-xl font-afacad font-semibold text-[var(--color-primary)]">
                            Premios ({totalPremios})
                        </h3>
                    </div>
                    {totalPremios === 0 ? (
                        <p className="text-[var(--color-gray-text)]">No has agregado premios.</p>
                    ) : (
                        <ul className="space-y-3">
                            {premiosOrdenados.map((premio, index) => (
                                <li
                                    key={premio.id || index}
                                    className="border border-[var(--color-light-gray)] rounded-xl p-4"
                                >
                                    <div className="flex flex-wrap items-center justify-between gap-2">
                                        <p className="font-semibold text-[var(--color-dark-text)]">{premio.name || "Sin nombre"}</p>
                                        <span className="text-xs font-semibold px-3 py-1 rounded-full bg-[var(--color-light-gray)] text-[var(--color-primary)]">
                                            Lugar {premio.place || "—"} de {totalPremios}
                                        </span>
                                    </div>
                                    <p className="text-sm text-[var(--color-gray-text)] mt-2">
                                        {premio.description || "Sin descripción"}
                                    </p>
                                    <p className="text-xs text-[var(--color-gray-text)] mt-2">
                                        Imagen: {premio.imageFile?.name || premio.imageUrl || "Pendiente"}
                                    </p>
                                </li>
                            ))}
                        </ul>
                    )}
                </section>
            </div>

            <p className="text-sm text-[var(--color-gray-text)] mt-6">
                Si encuentras un error, usa el botón &ldquo;Anterior&rdquo; para corregirlo antes de crear el sorteo.
            </p>
        </div>
    );
}

