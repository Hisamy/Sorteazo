import React from 'react';
import { Trophy, FileBarChart, Bell, Pencil, Trash2 } from "lucide-react";

const CardSorteoOrganizador = ({
    sorteo,
    onDelete,
    onClick,
    onEdit,
    onNotification,
}) => {
    const { id, title, ticketPrice, raffleDateTime, imageUrl } = sorteo;

    const date = new Date(raffleDateTime);
    const formattedDate = !isNaN(date) ? date.toLocaleDateString('es-ES', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric'
    }) : 'Fecha inválida';

    const handleActionClick = (e, callback) => {
        e.stopPropagation();
        if (callback) callback(id);
    };

    return (
        <div
            onClick={onClick}
            className="group relative flex flex-col sm:flex-row bg-white border border-gray-200 rounded-xl overflow-hidden shadow-sm hover:shadow-lg transition-all duration-300 cursor-pointer"
        >
            {/* 1. IMAGEN - Izquierda en desktop, arriba en móvil */}
            <div className="relative w-full sm:w-48 h-32 sm:h-auto shrink-0">
                <img
                    src={imageUrl}
                    alt={title}
                    className="w-full h-full object-cover"
                />
                {/* Overlay sutil al hacer hover */}
                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/5 transition-colors" />
            </div>

            {/* 2. CONTENIDO CENTRAL */}
            <div className="flex-grow p-5 flex flex-col justify-between">
                <div>
                    <div className="flex justify-between items-start">
                        <h2 className="text-xl font-bold text-gray-800 mb-2 line-clamp-1 group-hover:text-[var(--color-primary)] transition-colors">
                            {title}
                        </h2>
                    </div>

                    <div className="flex flex-wrap gap-x-6 gap-y-2 text-sm text-gray-500 mb-4">
                        <div className="flex flex-col">
                            <span className="text-xs uppercase tracking-wider text-gray-400">Precio boleto</span>
                            <span className="font-semibold text-gray-900 text-base">${ticketPrice}</span>
                        </div>
                        <div className="flex flex-col">
                            <span className="text-xs uppercase tracking-wider text-gray-400">Sorteo</span>
                            <span className="font-semibold text-[var(--color-primary)] text-base">{formattedDate}</span>
                        </div>
                    </div>
                </div>


            </div>

            {/* 3. COLUMNA DE MANTENIMIENTO  */}
            <div className="flex sm:flex-col justify-end sm:justify-start gap-1 p-3 bg-gray-50 border-t sm:border-t-0 sm:border-l border-gray-100">
                <ActionIconBtn
                    icon={<Pencil size={18} />}
                    label="Editar"
                    colorClass="text-gray-500 hover:text-[var(--color-primary)] hover:bg-white"
                    onClick={(e) => handleActionClick(e, onEdit)}
                />

                <ActionIconBtn
                    icon={<Bell size={18} />}
                    label="Notificaciones"
                    colorClass="text-gray-500 hover:text-yellow-600 hover:bg-white"
                    onClick={(e) => handleActionClick(e, onNotification)}
                />

                <div className="sm:mt-auto pt-2 sm:border-t border-gray-200">
                    <ActionIconBtn
                        icon={<Trash2 size={18} />}
                        label="Eliminar"
                        colorClass="text-gray-400 hover:text-red-600 hover:bg-red-50"
                        onClick={(e) => handleActionClick(e, onDelete)}
                    />
                </div>
            </div>
        </div>
    );
};

const ActionIconBtn = ({ icon, onClick, colorClass, label }) => (
    <button
        onClick={onClick}
        title={label}
        className={`p-2 rounded-lg transition-all duration-200 ${colorClass}`}
    >
        {icon}
    </button>
);

export default CardSorteoOrganizador;