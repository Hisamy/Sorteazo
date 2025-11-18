import { useState, useEffect } from "react";
import { TopNavBar } from "./util-components/TopNavBar";
import { EmptyStateCard } from "./util-components/EmptyStateCard";
import CardSorteoCliente from "./consulta-sorteo-components/CardSorteoCliente";
import sorteoImage from './assets/images/sorteo-placeholder.png';
import { FaSearch } from 'react-icons/fa';
import { useNavigate } from "react-router-dom";
import { obtenerTodosLosSorteos } from "./services/SorteazoApi";

export function DashboardCliente() {
    const navigate = useNavigate();

    const [sorteos, setSorteos] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [searchTerm, setSearchTerm] = useState('');

    useEffect(() => {
        const cargarSorteos = async () => {
            try {
                setLoading(true);
                const data = await obtenerTodosLosSorteos();
                const sorteosMapeados = data.map(sorteo => {
                    const fullImageUrl = sorteo.imageUrl
                        ? `${import.meta.env.VITE_API_URL}${sorteo.imageUrl}`
                        : sorteoImage;

                    return {
                        id: sorteo.id,
                        title: sorteo.title || '', 
                        ticketPrice: sorteo.ticketPrice, 
                        raffleDateTime: sorteo.raffleDateTime, 
                        imageUrl: fullImageUrl 
                    };
                });
                setSorteos(sorteosMapeados);
            } catch (err) {
                setError("No se pudieron cargar los sorteos. Inténtalo de nuevo más tarde.");
                console.error(err);
            } finally {
                setLoading(false);
            }
        };

        cargarSorteos();
    }, []);

    const filteredSorteos = sorteos.filter(sorteo =>
        sorteo.title.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="min-h-screen bg-[var(--color-background)]">
            <TopNavBar showLogout={true} />
            
            <div className="container mx-auto px-8 py-10 max-w-4xl">
                <div className="mb-8">
                    <h1 className="font-afacad text-4xl font-bold text-[var(--color-dark-text)] mb-2">
                        Hola Cliente!
                    </h1>
                    <p className="font-afacad text-lg text-[var(--color-gray-text)]">
                        Busca y participa en sorteos disponibles
                    </p>
                </div>

                <div className="relative mb-8">
                    <input
                        type="text"
                        placeholder="Busca..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full pl-4 pr-10 py-3 font-afacad border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]"
                    />
                    <FaSearch className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400" />
                </div>

                <div className="grid grid-cols-1 gap-6">
                    {loading && <p className="text-center text-gray-500">Cargando sorteos...</p>}
                    {error && <EmptyStateCard message={error} />}
                    {!loading && !error && (
                        filteredSorteos.length > 0 ? (
                            filteredSorteos.map(sorteo => (
                                <CardSorteoCliente
                                    key={sorteo.id}
                                    sorteo={sorteo}
                                    onClick={() => navigate(`/sorteos/cliente/${sorteo.id}`, { state: { sorteo } })}
                                />
                            ))
                        ) : (
                            <EmptyStateCard 
                                message="No se encontraron sorteos disponibles."
                            />
                        )
                    )}
                </div>
            </div>
        </div>
    );
}
