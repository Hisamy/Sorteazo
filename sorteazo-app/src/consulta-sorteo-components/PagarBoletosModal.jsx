import React, { useState } from 'react';
import { FaTimes, FaCreditCard, FaInfoCircle } from 'react-icons/fa';
import { FaMoneyBillTransfer } from 'react-icons/fa6';
import { ComprobantePagoUploader } from './ComprobantePagoUploader';
import { TarjetaFormulario } from './TarjetaFormulario';

export const PagarBoletosModal = ({ isOpen, onClose, onConfirm, boletos, precioBoleto }) => {
    const [metodoPago, setMetodoPago] = useState('TRANSFERENCIA');
    const [comprobanteFile, setComprobanteFile] = useState(null);
    const [errorComprobante, setErrorComprobante] = useState('');
    const [datosTarjeta, setDatosTarjeta] = useState(null);
    const [errorsTarjeta, setErrorsTarjeta] = useState({});
    const [loading, setLoading] = useState(false);

    if (!isOpen) return null;

    const precio = parseFloat(precioBoleto) || 0;
    const total = (boletos.length * precio).toFixed(2);

    const handleFileChange = (file) => {
        setComprobanteFile(file);
        if (file) {
            setErrorComprobante('');
        }
    };

    const handleDatosTarjetaChange = (datos) => {
        setDatosTarjeta(datos);
        // Limpiar errores cuando el usuario escribe
        setErrorsTarjeta({});
    };

    const validarDatosTarjeta = () => {
        const errores = {};

        if (!datosTarjeta?.nombreTitular || datosTarjeta.nombreTitular.trim().length < 3) {
            errores.nombreTitular = 'Ingresa el nombre completo del titular';
        }

        const numeroLimpio = datosTarjeta?.numeroTarjeta?.replace(/\s/g, '') || '';
        if (!numeroLimpio || numeroLimpio.length < 15 || numeroLimpio.length > 16) {
            errores.numeroTarjeta = 'Ingresa un número de tarjeta válido (15-16 dígitos)';
        }

        const fechaCompleta = datosTarjeta?.fechaVencimiento || '';
        if (!fechaCompleta || fechaCompleta.length !== 5) {
            errores.fechaVencimiento = 'Formato MM/YY';
        } else {
            const [mes, año] = fechaCompleta.split('/');
            const mesNum = parseInt(mes, 10);
            if (mesNum < 1 || mesNum > 12) {
                errores.fechaVencimiento = 'Mes inválido';
            }
        }

        if (!datosTarjeta?.cvv || datosTarjeta.cvv.length < 3) {
            errores.cvv = 'Ingresa 3 o 4 dígitos';
        }

        return errores;
    };

    const handleSubmit = async () => {
        // Validar según método de pago
        if (metodoPago === 'TRANSFERENCIA') {
            if (!comprobanteFile) {
                setErrorComprobante('Debes subir un comprobante de pago para continuar');
                return;
            }
        } else if (metodoPago === 'PAGO EN LINEA') {
            const errores = validarDatosTarjeta();
            if (Object.keys(errores).length > 0) {
                setErrorsTarjeta(errores);
                return;
            }
        }

        setLoading(true);
        try {
            // Llamar función de confirmación pasando los datos necesarios
            await onConfirm({
                metodoPago,
                comprobanteFile,
                datosTarjeta,
                boletos,
                total
            });
            // Limpiar estado y cerrar modal
            handleClose();
        } catch (error) {
            console.error('Error al procesar pago:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleClose = () => {
        setComprobanteFile(null);
        setErrorComprobante('');
        setDatosTarjeta(null);
        setErrorsTarjeta({});
        setMetodoPago('TRANSFERENCIA');
        setLoading(false);
        onClose();
    };

    return (
        <div 
            className="fixed inset-0 bg-black/50 z-50 flex justify-center items-center p-4"
            onClick={handleClose}
        >
            <div 
                className="bg-white rounded-xl shadow-2xl w-full max-w-2xl relative flex flex-col overflow-hidden max-h-[90vh]"
                onClick={(e) => e.stopPropagation()}
            >
                {/* Header */}
                <div className="flex justify-between items-center p-5 border-b">
                    <h2 className="text-2xl font-bold font-afacad text-gray-800">Pagar Boletos</h2>
                    <button 
                        onClick={handleClose} 
                        className="text-gray-400 hover:text-gray-600 transition-colors"
                        disabled={loading}
                    >
                        <FaTimes size={24} />
                    </button>
                </div>

                {/* Body - Scrollable */}
                <div className="p-6 overflow-y-auto flex-1">
                    {/* Resumen de boletos */}
                    <div className="mb-6">
                        <p className="text-gray-600 mb-3 font-afacad">Estás a punto de pagar los siguientes boletos:</p>
                        <div className="max-h-32 overflow-y-auto bg-gray-50 p-3 rounded-lg border">
                            <div className="flex flex-wrap gap-2">
                                {boletos
                                    .map(b => typeof b === 'number' ? b : b.numero)
                                    .sort((a, b) => a - b)
                                    .map(numero => (
                                        <span 
                                            key={numero} 
                                            className="bg-blue-100 text-blue-800 font-mono text-sm font-semibold px-3 py-1 rounded-full"
                                        >
                                            {numero}
                                        </span>
                                    ))
                                }
                            </div>
                        </div>
                    </div>

                    {/* Resumen de pago */}
                    <div className="border-t pt-4 mb-6 space-y-2 text-lg font-afacad">
                        <div className="flex justify-between">
                            <span className="text-gray-500">Total de boletos:</span>
                            <span className="font-semibold text-gray-800">{boletos.length}</span>
                        </div>
                        <div className="flex justify-between">
                            <span className="text-gray-500">Precio por boleto:</span>
                            <span className="font-semibold text-gray-800">${precio.toFixed(2)}</span>
                        </div>
                        <div className="flex justify-between text-xl border-t pt-2">
                            <span className="font-bold text-gray-800">Total a Pagar:</span>
                            <span className="font-bold text-green-600">${total}</span>
                        </div>
                    </div>

                    {/* Selector de método de pago */}
                    <div className="mb-6">
                        <label className="block text-sm font-semibold text-gray-700 font-afacad mb-3">
                            Método de Pago *
                        </label>
                        <div className="grid grid-cols-2 gap-4">
                            {/* Opción Transferencia */}
                            <button
                                type="button"
                                onClick={() => setMetodoPago('TRANSFERENCIA')}
                                className={`flex flex-col items-center justify-center p-4 border-2 rounded-xl transition-all duration-200 ${
                                    metodoPago === 'TRANSFERENCIA'
                                        ? 'border-[var(--color-primary)] bg-green-50 shadow-md'
                                        : 'border-gray-300 hover:border-gray-400 bg-white'
                                }`}
                                disabled={loading}
                            >
                                <FaMoneyBillTransfer 
                                    size={32} 
                                    className={metodoPago === 'TRANSFERENCIA' ? 'text-[var(--color-primary)]' : 'text-gray-400'}
                                />
                                <span className={`mt-2 font-afacad font-semibold ${
                                    metodoPago === 'TRANSFERENCIA' ? 'text-[var(--color-primary)]' : 'text-gray-600'
                                }`}>
                                    Transferencia
                                </span>
                            </button>

                            {/* Opción Pago en Línea */}
                            <button
                                type="button"
                                onClick={() => setMetodoPago('PAGO EN LINEA')}
                                className={`flex flex-col items-center justify-center p-4 border-2 rounded-xl transition-all duration-200 ${
                                    metodoPago === 'PAGO EN LINEA'
                                        ? 'border-[var(--color-primary)] bg-green-50 shadow-md'
                                        : 'border-gray-300 hover:border-gray-400 bg-white'
                                }`}
                                disabled={loading}
                            >
                                <FaCreditCard 
                                    size={32} 
                                    className={metodoPago === 'PAGO EN LINEA' ? 'text-[var(--color-primary)]' : 'text-gray-400'}
                                />
                                <span className={`mt-2 font-afacad font-semibold ${
                                    metodoPago === 'PAGO EN LINEA' ? 'text-[var(--color-primary)]' : 'text-gray-600'
                                }`}>
                                    Pago en Línea
                                </span>
                            </button>
                        </div>
                    </div>

                    {/* Contenido según método de pago */}
                    {metodoPago === 'TRANSFERENCIA' && (
                        <div className="space-y-4">
                            {/* Información de transferencia */}
                            <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
                                <div className="flex items-start gap-2 mb-2">
                                    <FaInfoCircle className="text-blue-600 mt-1" />
                                    <div>
                                        <h3 className="font-afacad font-bold text-blue-900 mb-2">
                                            Datos para Transferencia
                                        </h3>
                                        <p className="text-sm text-blue-800 font-afacad mb-2">
                                            Realiza tu transferencia a la siguiente cuenta y sube el comprobante:
                                        </p>
                                        <div className="bg-white rounded-lg p-3 text-sm font-afacad space-y-1">
                                            <p><span className="font-semibold">Banco:</span> Banco XYZ</p>
                                            <p><span className="font-semibold">Cuenta:</span> 1234-5678-9012-3456</p>
                                            <p><span className="font-semibold">CLABE:</span> 012345678901234567</p>
                                            <p><span className="font-semibold">Titular:</span> Organizador del Sorteo</p>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Componente de subida de comprobante */}
                            <ComprobantePagoUploader 
                                onFileChange={handleFileChange}
                                error={errorComprobante}
                            />
                        </div>
                    )}

                    {metodoPago === 'PAGO EN LINEA' && (
                        <div className="space-y-4">
                            <div className="bg-green-50 border border-green-200 rounded-xl p-4">
                                <div className="flex items-start gap-2">
                                    <FaInfoCircle className="text-green-600 mt-1" />
                                    <div>
                                        <h3 className="font-afacad font-bold text-green-900 mb-2">
                                            Pago con Tarjeta (Simulado)
                                        </h3>
                                        <p className="text-sm text-green-800 font-afacad">
                                            Ingresa los datos de tu tarjeta. Tu pago se procesará automáticamente.
                                            Esta es una versión simulada - no se realizará ningún cargo real.
                                        </p>
                                    </div>
                                </div>
                            </div>

                            <TarjetaFormulario 
                                onDatosChange={handleDatosTarjetaChange}
                                errors={errorsTarjeta}
                            />
                        </div>
                    )}
                </div>

                {/* Footer - Botones de acción */}
                <div className="p-5 border-t bg-gray-50 flex justify-end gap-3">
                    <button 
                        onClick={handleClose} 
                        className="bg-gray-200 hover:bg-gray-300 text-gray-800 font-bold py-2 px-6 rounded-lg transition-colors font-afacad disabled:opacity-50"
                        disabled={loading}
                    >
                        Cancelar
                    </button>
                    <button 
                        onClick={handleSubmit} 
                        className="bg-green-600 hover:bg-green-700 text-white font-bold py-2 px-6 rounded-lg transition-colors font-afacad flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                        disabled={loading}
                    >
                        {loading ? (
                            <>
                                <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>
                                Procesando...
                            </>
                        ) : (
                            'Confirmar Pago'
                        )}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default PagarBoletosModal;
