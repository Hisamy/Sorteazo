import React from 'react';
import { FaShoppingCart } from 'react-icons/fa';

export const FloatingActionBar = ({ count, totalPrice, onActionClick }) => {
    return (
        <div className="fixed bottom-0 left-0 right-0 bg-white shadow-[0_-2px_10px_rgba(0,0,0,0.1)] z-40">
            <div className="container mx-auto px-8 py-4 max-w-5xl flex justify-between items-center">
                <div>
                    <p className="font-bold text-lg text-gray-800">{count} boleto(s) seleccionado(s)</p>
                    <p className="text-green-600 font-semibold">Total a pagar: ${totalPrice.toFixed(2)}</p>
                </div>
                <button
                    onClick={onActionClick}
                    className="bg-green-600 hover:bg-green-700 text-white font-bold py-3 px-6 rounded-lg flex items-center gap-2 transition-transform transform hover:scale-105"
                >
                    <FaShoppingCart />
                    Apartar Boletos
                </button>
            </div>
        </div>
    );
};