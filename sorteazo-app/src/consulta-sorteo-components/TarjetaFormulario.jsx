import React, { useState } from 'react';
import { FaCreditCard, FaCalendar, FaLock, FaUser } from 'react-icons/fa';

export const TarjetaFormulario = ({ onDatosChange, errors }) => {
    const [datosTarjeta, setDatosTarjeta] = useState({
        nombreTitular: '',
        numeroTarjeta: '',
        fechaVencimiento: '',
        cvv: ''
    });

    const handleChange = (campo, valor) => {
        let valorFormateado = valor;

        // Formateo específico por campo
        if (campo === 'numeroTarjeta') {
            // Solo números y formatear con espacios cada 4 dígitos
            valorFormateado = valor.replace(/\D/g, '').slice(0, 16);
            valorFormateado = valorFormateado.match(/.{1,4}/g)?.join(' ') || valorFormateado;
        } else if (campo === 'fechaVencimiento') {
            // Formato MM/YY
            valorFormateado = valor.replace(/\D/g, '').slice(0, 4);
            if (valorFormateado.length >= 2) {
                valorFormateado = valorFormateado.slice(0, 2) + '/' + valorFormateado.slice(2);
            }
        } else if (campo === 'cvv') {
            // Solo 3 o 4 números
            valorFormateado = valor.replace(/\D/g, '').slice(0, 4);
        } else if (campo === 'nombreTitular') {
            // Solo letras y espacios
            valorFormateado = valor.replace(/[^a-zA-ZáéíóúÁÉÍÓÚñÑ\s]/g, '').toUpperCase();
        }

        const nuevosDatos = { ...datosTarjeta, [campo]: valorFormateado };
        setDatosTarjeta(nuevosDatos);
        
        // Notificar al componente padre
        if (onDatosChange) {
            onDatosChange(nuevosDatos);
        }
    };

    return (
        <div className="space-y-4">
            {/* Nombre del titular */}
            <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2 font-afacad flex items-center gap-2">
                    <FaUser className="text-gray-500" />
                    Nombre del Titular *
                </label>
                <input
                    type="text"
                    value={datosTarjeta.nombreTitular}
                    onChange={(e) => handleChange('nombreTitular', e.target.value)}
                    placeholder="JUAN PÉREZ GARCÍA"
                    className={`w-full px-4 py-3 rounded-lg border-2 font-afacad transition-colors ${
                        errors?.nombreTitular 
                            ? 'border-red-300 focus:border-red-500' 
                            : 'border-gray-300 focus:border-green-500'
                    } focus:outline-none`}
                />
                {errors?.nombreTitular && (
                    <p className="text-red-500 text-xs mt-1 font-afacad">{errors.nombreTitular}</p>
                )}
            </div>

            {/* Número de tarjeta */}
            <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2 font-afacad flex items-center gap-2">
                    <FaCreditCard className="text-gray-500" />
                    Número de Tarjeta *
                </label>
                <input
                    type="text"
                    value={datosTarjeta.numeroTarjeta}
                    onChange={(e) => handleChange('numeroTarjeta', e.target.value)}
                    placeholder="1234 5678 9012 3456"
                    maxLength="19"
                    className={`w-full px-4 py-3 rounded-lg border-2 font-mono tracking-wider text-lg transition-colors ${
                        errors?.numeroTarjeta 
                            ? 'border-red-300 focus:border-red-500' 
                            : 'border-gray-300 focus:border-green-500'
                    } focus:outline-none`}
                />
                {errors?.numeroTarjeta && (
                    <p className="text-red-500 text-xs mt-1 font-afacad">{errors.numeroTarjeta}</p>
                )}
            </div>

            {/* Fecha de vencimiento y CVV en la misma fila */}
            <div className="grid grid-cols-2 gap-4">
                {/* Fecha de vencimiento */}
                <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2 font-afacad flex items-center gap-2">
                        <FaCalendar className="text-gray-500" />
                        Vencimiento *
                    </label>
                    <input
                        type="text"
                        value={datosTarjeta.fechaVencimiento}
                        onChange={(e) => handleChange('fechaVencimiento', e.target.value)}
                        placeholder="MM/YY"
                        maxLength="5"
                        className={`w-full px-4 py-3 rounded-lg border-2 font-mono text-center transition-colors ${
                            errors?.fechaVencimiento 
                                ? 'border-red-300 focus:border-red-500' 
                                : 'border-gray-300 focus:border-green-500'
                        } focus:outline-none`}
                    />
                    {errors?.fechaVencimiento && (
                        <p className="text-red-500 text-xs mt-1 font-afacad">{errors.fechaVencimiento}</p>
                    )}
                </div>

                {/* CVV */}
                <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2 font-afacad flex items-center gap-2">
                        <FaLock className="text-gray-500" />
                        CVV *
                    </label>
                    <input
                        type="text"
                        value={datosTarjeta.cvv}
                        onChange={(e) => handleChange('cvv', e.target.value)}
                        placeholder="123"
                        maxLength="4"
                        className={`w-full px-4 py-3 rounded-lg border-2 font-mono text-center transition-colors ${
                            errors?.cvv 
                                ? 'border-red-300 focus:border-red-500' 
                                : 'border-gray-300 focus:border-green-500'
                        } focus:outline-none`}
                    />
                    {errors?.cvv && (
                        <p className="text-red-500 text-xs mt-1 font-afacad">{errors.cvv}</p>
                    )}
                </div>
            </div>

            {/* Información de seguridad */}
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 mt-4">
                <div className="flex items-start gap-2">
                    <FaLock className="text-blue-600 mt-1 flex-shrink-0" />
                    <p className="text-xs text-blue-800 font-afacad">
                        Tus datos están seguros. Esta es una simulación y no se procesará ningún cargo real.
                    </p>
                </div>
            </div>
        </div>
    );
};
