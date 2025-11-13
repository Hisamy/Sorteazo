import { useState } from "react";
import { TopNavBar } from "./util-components/TopNavBar";
import { EmptyStateCard } from "./util-components/EmptyStateCard";
import CardSorteoCliente from "./consulta-sorteo-components/CardSorteoCliente";
import sorteoImage from './assets/images/sorteo-placeholder.png';
import { FaSearch } from 'react-icons/fa';

export function DashboardCliente() {
    const [sorteos, setSorteos] = useState([
        {
            id: 1,
            nombre: 'Sorteo Potro Millonario 2025',
            precioBoleto: 50,
            fechaSorteo: '2025-11-30',
            imagen: sorteoImage
        }
    ]);
    const [searchTerm, setSearchTerm] = useState('');

    const filteredSorteos = sorteos.filter(sorteo =>
        sorteo.nombre.toLowerCase().includes(searchTerm.toLowerCase())
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
                    {filteredSorteos.length > 0 ? (
                        filteredSorteos.map(sorteo => (
                            <CardSorteoCliente
                                key={sorteo.id}
                                sorteo={sorteo}
                            />
                        ))
                    ) : (
                        <EmptyStateCard 
                            message="No se encontraron sorteos disponibles."
                        />
                    )}
                </div>
            </div>
        </div>
    );
}
