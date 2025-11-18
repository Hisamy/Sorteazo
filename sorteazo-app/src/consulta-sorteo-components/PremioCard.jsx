import React from 'react';

export const PremioCard = ({ premio }) => {
    const fullImageUrl = premio.imageUrl
        ? `${import.meta.env.VITE_API_URL}${premio.imageUrl}`
        : 'https://via.placeholder.com/150';

    return (
        <div className="flex items-start gap-4 p-4 border-b border-gray-200 last:border-b-0">
            <img src={fullImageUrl} alt={premio.name} className="w-24 h-24 object-cover rounded-lg shadow-sm" />
            <div className="flex-1">
                <span className="inline-block bg-blue-100 text-blue-800 text-xs font-semibold px-2.5 py-0.5 rounded-full mb-2">
                    {premio.place}° Lugar
                </span>
                <h3 className="text-lg font-bold text-gray-800">{premio.name}</h3>
                <p className="text-sm text-gray-600 mt-1">{premio.description}</p>
            </div>
        </div>
    );
};