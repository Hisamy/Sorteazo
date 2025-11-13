import React from 'react';
import { FaTrash } from 'react-icons/fa';

const CardSorteoOrganizador = ({ sorteo, onDelete }) => {
    const { id, nombre, precioBoleto, fechaSorteo, imagen } = sorteo;

    const date = new Date(fechaSorteo + 'T00:00:00');
    const formattedDate = !isNaN(date) ? date.toLocaleDateString('es-ES', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric'
    }) : 'Fecha inválida';

    return (
        <div className="flex items-center gap-6 bg-white border border-gray-200 rounded-lg p-4 shadow-sm">
            <img src={imagen} alt={nombre} className="w-28 h-20 object-cover rounded-md" />
            <div className="flex-grow">
                <h2 className="text-xl font-semibold text-gray-800 mb-3">{nombre}</h2>
                <div className="flex gap-10 text-sm text-gray-500">
                    <p>
                        Precio del boleto:
                        <strong className="block text-base font-medium text-gray-900 mt-0.5">${precioBoleto}</strong>
                    </p>
                    <p>
                        Fecha del sorteo:
                        <strong className="block text-base font-semibold text-green-700 mt-0.5">{formattedDate}</strong>
                    </p>
                </div>
            </div>
            <button 
                onClick={() => onDelete(id)} 
                className="text-gray-500 hover:text-red-600 text-lg p-2" 
                aria-label="Eliminar sorteo"
            >
                <FaTrash />
            </button>
        </div>
    );
};

export default CardSorteoOrganizador;