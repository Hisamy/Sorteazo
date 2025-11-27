import { useState, forwardRef, useImperativeHandle } from 'react';
import { CardPremio } from '../form-components/CardPremio';
import Swal from "sweetalert2";

export const Paso3Placeholder = forwardRef(({ initialData, errors = {} }, ref) => {

    const initialPrizes = initialData?.prizes || initialData?.premios;
    const [prizes, setPrizes] = useState(initialPrizes?.length ? initialPrizes : [
        { id: 1, name: '', place: 1, description: '', imageFile: null }
    ]);

    useImperativeHandle(ref, () => ({
        getPrizes: () => prizes
    }));

    const handleImageChange = (index, event) => {
        const file = event.target.files[0];

        if (!file) return;

        const maxSize = 5 * 1024 * 1024;

        if (file.size > maxSize) {
            Swal.fire({
                icon: "warning",
                title: "Imagen demasiado pesada",
                text: "La imagen es demasiado pesada. El máximo permitido es 5 MB."
            });
            return;
        }

        const newPrizes = [...prizes];
        newPrizes[index].imageFile = file;
        setPrizes(newPrizes);
    };

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

            <p className="text-[var(--color-gray-text)] mb-4 font-afacad">
                Define los premios que se llevarán tus participantes
            </p>

            {errors?.general && (
                <p className="text-sm text-red-600 font-afacad mb-4">{errors.general}</p>
            )}

            <div className="space-y-4">
                {prizes.map((prize, index) => (
                    <CardPremio
                        key={prize.id}
                        index={index}
                        prize={prize}
                        totalPrizes={prizes.length}
                        handleChange={handleChangePrize}
                        handleImageChange={handleImageChange}
                        handleRemove={handleRemovePrize}
                        errors={errors?.premios?.[index]}
                    />
                ))}
            </div>
        </>
    );
});