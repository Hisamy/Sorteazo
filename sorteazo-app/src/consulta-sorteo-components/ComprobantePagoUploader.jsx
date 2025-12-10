import React, { useState } from 'react';
import { FaUpload, FaTrash, FaCheckCircle, FaExclamationCircle } from 'react-icons/fa';

export const ComprobantePagoUploader = ({ onFileChange, error }) => {
    const [preview, setPreview] = useState(null);
    const [fileName, setFileName] = useState('');

    const handleFileSelect = (e) => {
        const file = e.target.files[0];
        if (file) {
            // Validar que sea imagen
            if (!file.type.startsWith('image/')) {
                alert('Por favor selecciona un archivo de imagen válido');
                return;
            }

            // Validar tamaño (max 5MB)
            if (file.size > 5 * 1024 * 1024) {
                alert('La imagen no debe superar los 5MB');
                return;
            }

            setFileName(file.name);
            
            // Crear preview
            const reader = new FileReader();
            reader.onloadend = () => {
                setPreview(reader.result);
            };
            reader.readAsDataURL(file);

            // Notificar al componente padre
            onFileChange(file);
        }
    };

    const handleRemove = () => {
        setPreview(null);
        setFileName('');
        onFileChange(null);
    };

    return (
        <div className="space-y-4">
            <label className="block text-sm font-semibold text-gray-700 font-afacad mb-2">
                Comprobante de Pago *
            </label>

            {!preview ? (
                // Estado vacío - Zona de carga
                <label 
                    htmlFor="comprobante-upload" 
                    className={`flex flex-col items-center justify-center w-full h-48 border-2 border-dashed rounded-xl cursor-pointer transition-all duration-200 ${
                        error 
                            ? 'border-red-400 bg-red-50 hover:bg-red-100' 
                            : 'border-[var(--color-gray-text)] bg-[var(--color-light-gray)] hover:bg-gray-200 hover:border-[var(--color-primary)]'
                    }`}
                >
                    <div className="flex flex-col items-center justify-center pt-5 pb-6">
                        <FaUpload 
                            className={`w-10 h-10 mb-3 ${error ? 'text-red-500' : 'text-[var(--color-gray-text)]'}`} 
                        />
                        <p className="mb-2 text-sm font-afacad font-semibold text-gray-700">
                            <span className="text-[var(--color-primary)]">Haz clic para subir</span> o arrastra aquí
                        </p>
                        <p className="text-xs text-gray-500 font-afacad">
                            PNG, JPG o JPEG (máx. 5MB)
                        </p>
                    </div>
                    <input 
                        id="comprobante-upload" 
                        type="file" 
                        className="hidden" 
                        accept="image/png,image/jpeg,image/jpg"
                        onChange={handleFileSelect}
                    />
                </label>
            ) : (
                // Estado con imagen cargada - Preview
                <div className="relative border-2 border-green-400 bg-green-50 rounded-xl p-4 transition-all duration-200">
                    <div className="absolute top-2 right-2">
                        <button
                            type="button"
                            onClick={handleRemove}
                            className="bg-red-500 hover:bg-red-600 text-white p-2 rounded-lg transition-colors duration-200 shadow-md"
                            title="Eliminar imagen"
                        >
                            <FaTrash size={16} />
                        </button>
                    </div>

                    <div className="flex items-center gap-2 mb-3">
                        <FaCheckCircle className="text-green-600" size={20} />
                        <p className="text-sm font-afacad font-semibold text-green-700">
                            Imagen cargada correctamente
                        </p>
                    </div>

                    <div className="flex flex-col items-center">
                        <img 
                            src={preview} 
                            alt="Preview del comprobante" 
                            className="max-h-64 rounded-lg shadow-md object-contain border border-gray-200"
                        />
                        <p className="mt-3 text-xs text-gray-600 font-afacad truncate max-w-full">
                            {fileName}
                        </p>
                    </div>
                </div>
            )}

            {error && (
                <div className="flex items-center gap-2 text-red-600 text-sm font-afacad">
                    <FaExclamationCircle />
                    <span>{error}</span>
                </div>
            )}

            <p className="text-xs text-gray-500 font-afacad italic">
                💡 Asegúrate de que el comprobante sea legible y contenga la información completa de la transferencia.
            </p>
        </div>
    );
};
