import React from 'react';

const Boleto = ({ boleto, onBoletoClick }) => {
    const { number, isReserved } = boleto;

    const estado = isReserved ? 'apartado' : 'disponible';

    const baseStyle = "w-10 h-10 flex items-center justify-center rounded-full font-bold border-2 transition-colors duration-200 cursor-pointer";
    let stateStyle = "";

    switch (estado) {
        case 'apartado':
            stateStyle = "bg-gray-400 border-gray-400 text-white";
            break;
        case 'disponible':
        default:
            stateStyle = "bg-white border-gray-400 text-gray-600 hover:bg-blue-100 hover:border-blue-500";
            break;
    }

    const handleClick = () => {
        if (onBoletoClick) {
            onBoletoClick(boleto); // Pasa el objeto completo
        }
    };

    return (
        <div onClick={handleClick} className={`${baseStyle} ${stateStyle}`}>
            {number.toString().slice(-2).padStart(2, '0')}
        </div>
    );
};

export const BoletoGrid = ({ boletos, onBoletoClick }) => {
    if (!boletos || boletos.length === 0) {
        return <p className="text-center text-gray-500">Cargando boletos...</p>;
    }

    return (
        <div className="grid grid-cols-10 gap-3 justify-items-center">
            {boletos.map((boleto) => (
                <Boleto key={boleto.id} boleto={boleto} onBoletoClick={onBoletoClick} />
            ))}
        </div>
    );
};