import React from 'react';
import { FaTrash } from 'react-icons/fa';
import { FaEdit } from "react-icons/fa";
import { IoNotificationsSharp } from "react-icons/io5";


const CardSorteoOrganizador = ({ sorteo, onDelete, onClick, onEdit, onNotification }) => {
    const { id, title, ticketPrice, raffleDateTime, imageUrl } = sorteo;

    const date = new Date(raffleDateTime);
    const formattedDate = !isNaN(date) ? date.toLocaleDateString('es-ES', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric'
    }) : 'Fecha inválida';

    const handleCardClick = (e) => {
        if (e.target.closest('button')) {
            return;
        }
        if (onClick) {
            onClick();
        }
    };

    const handleNotificationsClick = (e) => {
        onNotification(id);
    };

    const handleEditClick = (e) => {
        onEdit(id);
    };

    const handleDeleteClick = (e) => {
        e.stopPropagation();
        onDelete(id);
    };

    return (
        <div onClick={handleCardClick} className="flex items-center gap-6 bg-white border border-gray-200 rounded-lg p-4 shadow-sm cursor-pointer hover:shadow-md transition-shadow">
            <img src={imageUrl} alt={title} className="w-28 h-20 object-cover rounded-md" />
            <div className="flex-grow">
                <h2 className="text-xl font-semibold text-gray-800 mb-3 line-clamp-1">{title}</h2>
                <div className="flex gap-10 text-sm text-gray-500">
                    <p>
                        Precio del boleto:
                        <strong className="block text-base font-medium text-gray-900 mt-0.5">${ticketPrice}</strong>
                    </p>
                    <p>
                        Fecha del sorteo:
                        <strong className="block text-base font-semibold text-green-700 mt-0.5">{formattedDate}</strong>
                    </p>
                </div>
            </div>
            <div>
                <button
                    onClick={handleNotificationsClick}
                    className="text-gray-500  hover:text-red-600 text-lg p-2 z-10"
                    aria-label="Notification"
                >
                    <IoNotificationsSharp />
                </button>
                <button
                    onClick={handleEditClick}
                    className="text-gray-500 hover:text-red-600 text-lg p-2 z-10"
                    aria-label="Edit sorteo"
                >
                    <FaEdit />
                </button>
                <button
                    onClick={handleDeleteClick}
                    className="text-gray-500 hover:text-red-600 text-lg p-1 z-10"
                    aria-label="Eliminar sorteo"
                >
                    <FaTrash />
                </button>

            </div>

        </div>
    );
};

export default CardSorteoOrganizador;