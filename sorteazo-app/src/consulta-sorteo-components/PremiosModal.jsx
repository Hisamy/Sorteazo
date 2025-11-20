import React from 'react';
import { FaTimes } from 'react-icons/fa';
import { PremioCard } from './PremioCard';

export const PremiosModal = ({ isOpen, premios, onClose }) => {
    if (!isOpen) {
        return null;
    }

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex justify-center items-center p-4">
            <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl relative max-h-[90vh] flex flex-col">
                <div className="flex justify-between items-center p-6 border-b">
                    <h2 className="text-2xl font-bold font-afacad text-gray-800">
                        Premios del Sorteo
                    </h2>
                    <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
                        <FaTimes size={24} />
                    </button>
                </div>

                <div className="overflow-y-auto p-2">
                    {premios && premios.length > 0 ? (
                        premios
                            .sort((a, b) => a.place - b.place) 
                            .map(premio => <PremioCard key={premio.id} premio={premio} />)
                    ) : (
                        <p className="text-center text-gray-500 p-8">No hay premios registrados para este sorteo.</p>
                    )}
                </div>

                <div className="p-6 border-t text-right">
                    <button
                        onClick={onClose}
                        className="bg-gray-200 hover:bg-gray-300 text-gray-800 font-bold py-2 px-6 rounded-lg"
                    >
                        Cerrar
                    </button>
                </div>
            </div>
        </div>
    );
};