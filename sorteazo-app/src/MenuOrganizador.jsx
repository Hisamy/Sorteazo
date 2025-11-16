import React, { useState } from 'react';
import TopNavBar from '../util-components/TopNavBar';
import CardSorteo from '../components/CardSorteo';
import sorteoImage from '../assets/images/sorteo-placeholder.png'; // Asegúrate que la ruta sea correcta

const MenuOrganizador = () => {
    const [sorteos, setSorteos] = useState([
        {
            id: 1,
            nombre: 'Sorteo Potro Millonario 2025',
            precioBoleto: 50,
            fechaSorteo: '2025-11-30',
            imagen: sorteoImage
        }
    ]);

    const handleDelete = (id) => {
        setSorteos(sorteos.filter(s => s.id !== id));
        console.log(`Sorteo con id ${id} eliminado`);
    };

    return (
        <div className="bg-gray-50 min-h-screen">
            <TopNavBar />
            <main className="max-w-4xl mx-auto p-8">
                <header className="flex justify-between items-center mb-8">
                    <div>
                        <h1 className="text-3xl font-bold text-gray-800">BIENVENIDO Organizador!</h1>
                        <p className="text-gray-500 mt-1">Administra o crea tus sorteos</p>
                    </div>
                    <button className="bg-green-600 text-white font-medium py-2 px-4 rounded-md hover:bg-green-700 transition-colors">
                        Crear sorteo
                    </button>
                </header>
                <section className="flex flex-col gap-6">
                    {sorteos.length > 0 ? (
                        sorteos.map(sorteo => (
                            <CardSorteo
                                key={sorteo.id}
                                sorteo={sorteo}
                                onDelete={handleDelete}
                            />
                        ))
                    ) : (
                        <div className="text-center py-12 px-6 bg-white rounded-lg border border-gray-200">
                            <p className="text-gray-500">Aún no has creado sorteos.</p>
                        </div>
                    )}
                </section>
            </main>
        </div>
    );
};

export default MenuOrganizador;