import React from 'react';
import { FaTimes } from 'react-icons/fa';

export const ConfirmacionApartadoModal = ({ isOpen, onClose, onConfirm, seleccionados, precioBoleto }) => {
    if (!isOpen) return null;

    const precio = parseFloat(precioBoleto) || 0;

    const total = (seleccionados.length * precio).toFixed(2);

    return (
        <div 
            className="fixed inset-0 bg-black/50 z-50 flex justify-center items-center p-4"
            onClick={onClose}
        >
            <div 
                className="bg-white rounded-xl shadow-2xl w-full max-w-md relative flex flex-col overflow-hidden"
                onClick={(e) => e.stopPropagation()}
            >
                <div className="flex justify-between items-center p-5 border-b">
                    <h2 className="text-2xl font-bold font-afacad text-gray-800">Confirmar Apartado</h2>
                    <button 
                        onClick={onClose} 
                        className="text-gray-400 hover:text-gray-600 transition-colors"
                    >
                        <FaTimes size={24} />
                    </button>
                </div>

                <div className="p-6">
                    <p className="text-gray-600 mb-4 font-afacad">Estás a punto de apartar los siguientes boletos:</p>
                    <div className="max-h-40 overflow-y-auto bg-gray-50 p-3 rounded-lg border mb-4">
                        <div className="flex flex-wrap gap-2">
                            {seleccionados.sort((a, b) => a - b).map(numero => (
                                <span 
                                    key={numero} 
                                    className="bg-blue-100 text-blue-800 font-mono text-sm font-semibold px-3 py-1 rounded-full"
                                >
                                    {numero}
                                </span>
                            ))}
                        </div>
                    </div>
                    <div className="border-t pt-4 space-y-2 text-lg font-afacad">
                        <div className="flex justify-between">
                            <span className="text-gray-500">Total de boletos:</span>
                            <span className="font-semibold text-gray-800">{seleccionados.length}</span>
                        </div>
                        <div className="flex justify-between">
                            <span className="text-gray-500">Precio por boleto:</span>
                            <span className="font-semibold text-gray-800">${precio.toFixed(2)}</span>
                        </div>
                        <div className="flex justify-between text-xl">
                            <span className="font-bold text-gray-800">Total a Pagar:</span>
                            <span className="font-bold text-green-600">${total}</span>
                        </div>
                    </div>
                </div>

                <div className="p-5 border-t bg-gray-50 flex justify-end gap-3">
                    <button 
                        onClick={onClose} 
                        className="bg-gray-200 hover:bg-gray-300 text-gray-800 font-bold py-2 px-6 rounded-lg transition-colors font-afacad"
                    >
                        Cancelar
                    </button>
                    <button 
                        onClick={onConfirm} 
                        className="bg-green-600 hover:bg-green-700 text-white font-bold py-2 px-6 rounded-lg transition-colors font-afacad"
                    >
                        Confirmar y Apartar
                    </button>
                </div>
            </div>
        </div>
    );
};

export default ConfirmacionApartadoModal;