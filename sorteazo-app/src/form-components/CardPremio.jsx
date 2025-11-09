import React from 'react';

export function CardPremio({ index, prize, handleChange, handleRemove }) {
    
    const title = index === 0 ? 'Primer Lugar' : `Premio #${index + 1}`;

    const handleInputChange = (e) => {
       
        handleChange(index, e);
    };

    return (
        <div className="p-6 border border-gray-300 rounded-xl mb-6 bg-white shadow-sm">
            
            <div className="flex justify-between items-center mb-4">
                
                <h3 className="text-lg font-bold text-[var(--color-primary)]">{title}</h3>
                
             
                {index > 0 && (
                    <button
                        onClick={() => handleRemove(index)}
                        className="text-sm text-red-600 hover:text-red-800 transition-colors duration-150"
                    >
                        Eliminar
                    </button>
                )}
            </div>

            <InputWrapper label="Nombre del premio:">
                <InputText
                    name="name"
                    placeholder="Ej. LG Laptop"
                    value={prize.name}
                    onChange={handleInputChange}
                />
            </InputWrapper>

 
            <InputWrapper label="Descripción:">
                <TextArea
                    name="description"
                    placeholder="Describe los detalles del premio."
                    value={prize.description}
                    onChange={handleInputChange}
                />
            </InputWrapper>

            <InputWrapper label="Imagen:">
               
                <InputFile name={`image-${index}`} /> 
            </InputWrapper>
        </div>
    );
}