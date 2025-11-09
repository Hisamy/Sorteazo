import React, { useState } from 'react';
import { CardPremio } from './CardPremio'; 

export function Paso3Premios({ initialData }) {
   
    const [prizes, setPrizes] = useState(initialData?.prizes || [
        { id: 1, name: '', description: '', image: null }
    ]);

    const handleAddPrize = () => {
        const newPrize = {
            id: Date.now(),
            name: '',
            description: '',
            image: null
        };
        setPrizes([...prizes, newPrize]);
    };

    const handleChangePrize = (index, event) => {
        const { name, value } = event.target;
        const newPrizes = [...prizes];
        newPrizes[index][name] = value;
        setPrizes(newPrizes);
    };

    const handleRemovePrize = (indexToRemove) => {
        setPrizes(prizes.filter((_, index) => index !== indexToRemove));
    };
    
    

    return (
        <>
            <div className="flex justify-between items-center">
                <h2 className="text-2xl font-afacad font-semibold text-[var(--color-dark-text)] mb-2">
                    Premios
                </h2>
                <button
                    onClick={handleAddPrize}
                    className="flex items-center space-x-1 px-3 py-1 bg-[var(--color-success)] text-white rounded-lg hover:bg-[var(--color-success-dark)] transition duration-150 text-sm font-semibold"
                >
                    <span className="text-xl leading-none">+</span>
                    <span>Agregar premio</span>
                </button>
            </div>
            
            <p className="text-[var(--color-gray-text)] mb-8 font-afacad">
                Define los premios que se llevarán tus participantes
            </p>

         
            <div className="py-2">
                {prizes.map((prize, index) => (
                    <CardPremio
                        key={prize.id}
                        index={index}
                        prize={prize}
                        handleChange={handleChangePrize}
                        handleRemove={handleRemovePrize}
                    />
                ))}
            </div>


          
        </>
    );
}