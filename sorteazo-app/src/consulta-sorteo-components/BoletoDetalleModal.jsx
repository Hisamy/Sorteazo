import React from 'react';
import { FaTimes } from 'react-icons/fa';

export const BoletoDetalleModal = ({ isOpen, boleto, onClose }) => {
    if (!isOpen || !boleto) {
        return null;
    }

    const statusText = boleto.isReserved ? "Apartado" : "Disponible";
    const statusColor = boleto.isReserved ? "text-red-600" : "text-green-600";

    return (
        <div className="fixed inset-0 bg-black/50 z-[9999] flex justify-center items-center p-4">
            <div className="bg-white rounded-lg shadow-xl p-8 w-full max-w-sm relative">
                <button onClick={onClose} className="absolute top-4 right-4 text-gray-400 hover:text-gray-600">
                    <FaTimes size={20} />
                </button>
                <h2 className="text-3xl font-bold font-afacad text-gray-800 mb-6 text-center">
                    Detalles del Boleto
                </h2>
                
                <div className="space-y-5 font-afacad text-center">
                    <div>
                        <p className="text-sm font-semibold text-gray-500 uppercase tracking-wider">Número</p>
                        <p className="font-bold text-5xl text-blue-600 mt-1">{boleto.number.toString().padStart(3, '0')}</p>
                    </div>
                    <div>
                        <p className="text-sm font-semibold text-gray-500 uppercase tracking-wider">Precio</p>
                        <p className="text-2xl text-gray-800 mt-1">${boleto.price}</p>
                    </div>
                    <div>
                        <p className="text-sm font-semibold text-gray-500 uppercase tracking-wider">Estado</p>
                        <p className={`text-2xl font-bold ${statusColor} mt-1`}>{statusText}</p>
                    </div>
                </div>

                <div className="mt-8 text-center">
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