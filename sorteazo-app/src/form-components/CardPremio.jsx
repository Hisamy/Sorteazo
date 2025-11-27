import { InputForm } from './InputForm';
import { TextAreaForm } from './TextAreaForm';

export function CardPremio({ index, prize, totalPrizes, handleChange, handleImageChange, handleRemove, errors = {} }) {

    const title = `Premio #${index + 1}`;
    const hasErrors = Boolean(errors && Object.keys(errors).length);

    const handleInputChange = (e) => {
        handleChange(index, e);
    };

    return (
        <div className={`p-6 border rounded-xl bg-white shadow-sm animate-[slideIn_0.3s_ease-out] ${hasErrors ? 'border-red-200 ring-1 ring-red-200' : 'border-[var(--color-light-gray)]'}`}>

            <div className="flex justify-between items-center mb-4">
                <h3 className={`text-lg font-afacad font-bold ${hasErrors ? 'text-red-600' : 'text-[var(--color-primary)]'}`}>{title}</h3>
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

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                <div>
                    <label className="block mb-2 text-[var(--color-dark-text)] font-semibold font-afacad">
                        Nombre del premio:
                    </label>
                    <InputForm
                        name="name"
                        placeholder="Ej. LG Laptop"
                        value={prize.name}
                        onChange={handleInputChange}
                        error={errors?.name}
                    />
                </div>
                <div>
                    <label className="block mb-2 text-[var(--color-dark-text)] font-semibold font-afacad">
                        Lugar (1er, 2do, 3er...):
                    </label>
                    <InputForm
                        type="number"
                        name="place"
                        placeholder="Ej. 1"
                        value={prize.place || ''}
                        onChange={handleInputChange}
                        min="1"
                        error={errors?.place}
                    />
                </div>
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
                    error={errors?.description}
                />
            </div>

            <div>
                <label className="block mb-2 text-[var(--color-dark-text)] font-semibold font-afacad">
                    Imagen del premio:
                </label>
                <input
                    type="file"
                    name={`imagenPremio-${index}`}
                    accept="image/*"
                    onChange={(e) => handleImageChange(index, e)}
                    className={`w-full border rounded-xl px-4 py-2 text-[var(--color-dark-text)] file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-[var(--color-light-gray)] file:text-[var(--color-dark-text)] hover:file:bg-[var(--color-gray-text)] hover:file:text-white focus:outline-none focus:ring-2 focus:border-transparent transition-all duration-200 ${errors?.imageFile ? 'border-red-500 focus:ring-red-500' : 'border-[var(--color-light-gray)] focus:ring-[var(--color-primary)]'}`}
                />
                {errors?.imageFile && (
                    <p className="mt-1 text-sm text-red-600 font-afacad">{errors.imageFile}</p>
                )}
            </div>
        </div>
    );
}