import React from 'react';

export const GridBoletos = ({ startNumber, endNumber, selectedNumbers = [], onNumberClick, reservedNumbers = [], readOnly = false }) => {
    const numbers = [];
    for (let i = startNumber; i <= endNumber; i++) {
        numbers.push(i);
    }

    const getNumberStatus = (number) => {
        if (reservedNumbers.includes(number)) return 'reserved';
        if (selectedNumbers.includes(number)) return 'selected';
        return 'available';
    };

    const getNumberStyle = (status) => {
        const baseStyle = "w-10 h-10 rounded-full flex items-center justify-center text-sm font-afacad font-semibold";
        const interactiveClass = readOnly ? "" : "transition-all duration-200 cursor-pointer";
        
        switch (status) {
            case 'selected':
                return `${baseStyle} ${interactiveClass} bg-green-500 text-white ${!readOnly ? 'hover:bg-green-600' : ''}`;
            case 'reserved':
                return `${baseStyle} bg-gray-400 text-white ${!readOnly ? 'cursor-not-allowed' : ''}`;
            case 'available':
            default:
                return `${baseStyle} ${interactiveClass} bg-white border-2 border-gray-300 text-gray-700 ${!readOnly ? 'hover:border-green-500 hover:bg-green-50' : ''}`;
        }
    };

    const handleClick = (number) => {
        if (readOnly) return;
        
        const status = getNumberStatus(number);
        if (status !== 'reserved' && onNumberClick) {
            onNumberClick(number);
        }
    };

    return (
        <div className="grid grid-cols-10 gap-2 p-4">
            {numbers.map((number) => {
                const status = getNumberStatus(number);
                const Element = readOnly ? 'div' : 'button';
                
                return (
                    <Element
                        key={number}
                        onClick={!readOnly ? () => handleClick(number) : undefined}
                        disabled={!readOnly && status === 'reserved'}
                        className={getNumberStyle(status)}
                        title={
                            readOnly
                                ? (status === 'reserved' ? 'Boleto apartado' : 'Boleto disponible')
                                : (status === 'reserved' 
                                    ? 'Boleto apartado' 
                                    : status === 'selected'
                                    ? 'Click para deseleccionar'
                                    : 'Click para seleccionar')
                        }
                    >
                        {number}
                    </Element>
                );
            })}
        </div>
    );
};
