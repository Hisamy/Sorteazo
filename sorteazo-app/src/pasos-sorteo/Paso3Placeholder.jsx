import { useState, forwardRef, useImperativeHandle } from 'react';
import { CardPremio } from '../form-components/CardPremio';

export const Paso3Placeholder = forwardRef(({ initialData }, ref) => {

    const [prizes, setPrizes] = useState(initialData?.prizes || [
        { id: 1, name: '', place: 1, description: '', imageFile: null }
    ]);

    useImperativeHandle(ref, () => ({
        getPrizes: () => prizes
    }));

    const handleAddPrize = () => {
        const newPrize = {
            id: Date.now(),
            name: '',
            place: prizes.length + 1,
            description: '',
            imageFile: null
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
        if (prizes.length > 1) {
            setPrizes(prizes.filter((_, index) => index !== indexToRemove));
        }
    };



    return (
        <>
            <div className="flex justify-between items-center mb-2">
                <h2 className="text-2xl font-afacad font-semibold text-[var(--color-dark-text)]">
                    Premios
                </h2>
                <button
                    type="button"
                    onClick={handleAddPrize}
                    className="flex items-center gap-2 px-4 py-2 bg-[var(--color-primary)] text-white rounded-xl font-afacad font-semibold hover:bg-[var(--color-primary-hover)] transition-colors duration-300"
                >
                    <span className="text-xl leading-none">+</span>
                    <span>Agregar premio</span>
                </button>
            </div>

            <p className="text-[var(--color-gray-text)] mb-8 font-afacad">
                Define los premios que se llevarán tus participantes
            </p>


            <div className="space-y-4">
                {prizes.map((prize, index) => (
                    <CardPremio
                        key={prize.id}
                        index={index}
                        prize={prize}
                        totalPrizes={prizes.length}
                        handleChange={handleChangePrize}
                        handleRemove={handleRemovePrize}
                    />
                ))}
            </div>
        </>
    );
});