import React from 'react';

const Boleto = ({ boleto, onBoletoClick }) => {
    const { numero, estado } = boleto;

    const baseStyle = "w-10 h-10 flex items-center justify-center rounded-full font-bold border-2 transition-colors duration-200 text-xs";
    let stateStyle = "";
    let isClickable = false;

    switch (estado) {
        case 'apartado':
            stateStyle = "bg-gray-400 border-gray-400 text-white cursor-not-allowed";
            break;
        case 'seleccionado':
            stateStyle = "bg-green-600 border-green-600 text-white cursor-pointer";
            isClickable = true;
            break;
        case 'disponible':
        default:
            stateStyle = "bg-white border-gray-400 text-gray-600 hover:bg-green-100 hover:border-green-500 cursor-pointer";
            isClickable = true;
            break;
    }

    const handleClick = () => {
        if (isClickable && onBoletoClick) {
            onBoletoClick(numero);
        }
    };

    return (
        <div onClick={handleClick} className={`${baseStyle} ${stateStyle}`}>
            {numero}
        </div>
    );
};

export const BoletoGrid = ({ boletos, onBoletoClick }) => {
    if (!boletos || boletos.length === 0) {
        return <p className="text-center text-gray-500">No hay boletos para mostrar.</p>;
    }

    return (
        <div className="grid grid-cols-10 gap-3 justify-items-center">
            {boletos.map((boleto) => (
                <Boleto key={boleto.numero} boleto={boleto} onBoletoClick={onBoletoClick} />
            ))}
        </div>
    );
};