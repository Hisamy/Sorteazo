export function SorteoCard({ titulo, descripcion, fecha, imagen, precio, onClick }) {
    return (
        <div 
            onClick={onClick}
            className="bg-white border border-[var(--color-light-gray)] rounded-xl p-6 hover:shadow-lg transition-all duration-300 cursor-pointer"
        >
            <div className="flex gap-6">
                <div className="w-32 h-32 bg-[var(--color-light-gray)] rounded-lg flex items-center justify-center flex-shrink-0">
                    {imagen ? (
                        <img src={imagen} alt={titulo} className="w-full h-full object-cover rounded-lg" />
                    ) : (
                        <span className="text-[var(--color-gray-text)] text-4xl">🎁</span>
                    )}
                </div>
                
                <div className="flex-1">
                    <h3 className="font-afacad text-2xl font-bold text-[var(--color-dark-text)] mb-2">
                        {titulo || "Sorteo sin título"}
                    </h3>
                    <p className="font-afacad text-[var(--color-gray-text)] mb-3 line-clamp-2">
                        {descripcion || "Sin descripción"}
                    </p>
                    <div className="flex items-center justify-between">
                        <div className="text-sm text-[var(--color-gray-text)] font-afacad">
                            {fecha && (
                                <span>📅 {fecha}</span>
                            )}
                        </div>
                        {precio && (
                            <div className="font-afacad text-xl font-bold text-[var(--color-primary)]">
                                ${precio}
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
