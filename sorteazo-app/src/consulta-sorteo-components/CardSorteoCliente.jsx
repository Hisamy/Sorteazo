import React from 'react';

const CardSorteoCliente = ({ sorteo, onClick }) => {
    const { title, ticketPrice, raffleDateTime, imageUrl } = sorteo;

    const date = new Date(raffleDateTime);
    const formattedDate = !isNaN(date) ? date.toLocaleString('es-ES', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric'
    }) : 'Fecha inválida';

    return (
        <div onClick={onClick} className="flex items-center gap-6 bg-white border border-gray-200 rounded-lg p-4 shadow-sm cursor-pointer hover:shadow-md transition-shadow">
            <img src={imageUrl} alt={title} className="w-32 h-24 object-cover rounded-md" />
            <div className="flex-grow">
                <h2 className="text-xl font-semibold text-gray-800 mb-3">{title}</h2>
                <div className="flex gap-10 text-sm text-gray-500">
                    <p>
                        Precio del boleto:
                        <strong className="block text-base font-medium text-gray-900 mt-0.5">
                            ${typeof ticketPrice === 'number' ? ticketPrice : '--'}
                        </strong>
                    </p>
                    <p>
                        Fecha del sorteo:
                        <strong className="block text-base font-semibold text-green-700 mt-0.5">{formattedDate}</strong>
                    </p>
                </div>
            </div>
        </div>
    );
};

export default CardSorteoCliente;