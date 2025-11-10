import { InputForm } from './InputForm';
import { TextAreaForm } from './TextAreaForm';

export function CardPremio({ index, prize, totalPrizes, handleChange, handleRemove }) {
    
    const title = `Premio #${index + 1}`;

    const handleInputChange = (e) => {
        handleChange(index, e);
    };

    return (
        <div className="p-6 border border-[var(--color-light-gray)] rounded-xl bg-white shadow-sm animate-[slideIn_0.3s_ease-out]">
            
            <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-afacad font-bold text-[var(--color-primary)]">{title}</h3>
                {totalPrizes > 1 && (
                    <button
                        type="button"
                        onClick={() => handleRemove(index)}
                        className="text-sm font-afacad font-semibold text-red-600 hover:text-red-800 transition-colors duration-200"
                    >
                        Eliminar
                    </button>
                )}
            </div>

            <div className="mb-4">
                <label className="block mb-2 text-[var(--color-dark-text)] font-semibold font-afacad">
                    Nombre del premio:
                </label>
                <InputForm
                    name="name"
                    placeholder="Ej. LG Laptop"
                    value={prize.name}
                    onChange={handleInputChange}
                />
            </div>

            <div className="mb-4">
                <label className="block mb-2 text-[var(--color-dark-text)] font-semibold font-afacad">
                    Descripción:
                </label>
                <TextAreaForm
                    name="description"
                    placeholder="Describe los detalles del premio."
                    value={prize.description}
                    onChange={handleInputChange}
                />
            </div>

            <div>
                <label className="block mb-2 text-[var(--color-dark-text)] font-semibold font-afacad">
                    Imagen:
                </label>
                <input
                    type="file"
                    name={`image-${index}`}
                    accept="image/*"
                    className="w-full border border-[var(--color-light-gray)] rounded-xl px-4 py-2 text-[var(--color-dark-text)] file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-[var(--color-light-gray)] file:text-[var(--color-dark-text)] hover:file:bg-[var(--color-gray-text)] hover:file:text-white focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)] focus:border-transparent transition-all duration-200"
                />
            </div>
        </div>
    );
}