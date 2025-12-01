import React from 'react';
import { FaTimes, FaUser, FaWhatsapp, FaReceipt, FaCheckCircle, FaExclamationCircle } from 'react-icons/fa';

export const BoletoDetalleModal = ({ isOpen, boleto, onClose }) => {
    if (!isOpen || !boleto) {
        return null;
    }

    const { number, price, estado, status, client, payment: pago } = boleto;
    
    const hasClientInfo = !!client; 
    const hasPaymentInfo = !!pago;
    
    // Determinar si está reservado basado en el estado o status
    const isReserved = estado === 'apartado' || estado === 'apartadoMio' || estado === 'apartadoOtro' || 
                       status === 'PAGO_PENDIENTE' || status === 'RESERVADO';
    const isPagado = estado === 'pagado' || status === 'PAGADO';

    const getImageUrl = (path) => {
        if (!path) return null;
        if (path.startsWith('http')) return path;
        return `${import.meta.env.VITE_API_URL}${path}`; 
    };

    const comprobanteUrl = (hasPaymentInfo && pago.comprobante?.imageUrl) 
        ? getImageUrl(pago.comprobante.imageUrl) 
        : null;

    // Determinar texto y color del estado
    let statusText = "Disponible";
    let statusColor = "text-green-600";
    
    if (isPagado) {
        statusText = "Pagado";
        statusColor = "text-blue-600";
    } else if (isReserved) {
        statusText = "Apartado";
        statusColor = "text-yellow-600";
    }

    return (
        <div className="fixed inset-0 bg-black/50 z-[9999] flex justify-center items-center p-4">
            <div className="bg-white rounded-lg shadow-xl p-8 w-full max-w-sm relative font-afacad">
                <button onClick={onClose} className="absolute top-4 right-4 text-gray-400 hover:text-gray-600">
                    <FaTimes size={20} />
                </button>
                <h2 className="text-3xl font-bold text-gray-800 mb-6 text-center">
                    Detalles del Boleto
                </h2>
                
                {/* Sección de Resumen del Boleto */}
                <div className="space-y-4 pb-4 border-b border-gray-200">
                    <div className="flex justify-between items-center">
                        <p className="text-sm font-semibold text-gray-500 uppercase tracking-wider">Número</p>
                        <p className="font-bold text-4xl text-blue-600">{number?.toString().padStart(3, '0')}</p>
                    </div>
                    <div className="flex justify-between items-center">
                        <p className="text-sm font-semibold text-gray-500 uppercase tracking-wider">Precio</p>
                        <p className="text-xl text-gray-800">${price}</p>
                    </div>
                    <div className="flex justify-between items-center">
                        <p className="text-sm font-semibold text-gray-500 uppercase tracking-wider">Estado</p>
                        <p className={`text-xl font-bold ${statusColor}`}>{statusText}</p>
                    </div>
                </div>

                {/* Sección de Cliente (Aparece si está apartado) */}
                {isReserved && hasClientInfo && (
                    <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                        <h3 className="text-sm font-bold text-blue-800 uppercase mb-2 flex items-center gap-2">
                            <FaUser /> Apartado por
                        </h3>
                        <p className="text-lg font-semibold text-gray-800">{client.name || 'Nombre no disponible'}</p>
                        {client.phoneNumber && (
                            <div className="flex items-center gap-2 mt-1 text-sm">
                                <FaWhatsapp className="text-green-600"/>
                                <a 
                                    href={`https://wa.me/${client.phoneNumber}`} 
                                    target="_blank" 
                                    rel="noreferrer" 
                                    className="text-gray-700 hover:text-green-600 hover:underline"
                                >
                                    {client.phoneNumber}
                                </a>
                            </div>
                        )}
                    </div>
                )}
                
                {/* Mensaje si está apartado pero sin cliente */}
                {isReserved && !hasClientInfo && (
                    <div className="mt-6 p-4 bg-yellow-50 border border-yellow-200 rounded-lg text-sm text-yellow-800 flex items-center gap-2">
                        <FaExclamationCircle />
                        <span>Boleto apartado sin datos de cliente registrados.</span>
                    </div>
                )}

                {/* Sección de Pago y Comprobante (Aparece si hay objeto de pago) */}
                {hasPaymentInfo && (
                    <div className="mt-6 p-4 bg-green-50 border border-green-200 rounded-lg">
                        <h3 className="text-sm font-bold text-green-800 uppercase mb-3 flex items-center gap-2">
                            <FaReceipt /> Información de Pago
                        </h3>
                        <div className="space-y-2 text-sm">
                            <div className="flex justify-between">
                                <span className="text-gray-600 font-semibold">Método:</span>
                                <span className="font-medium text-gray-800 capitalize">{pago.paymentMethod}</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-gray-600 font-semibold">Estatus:</span>
                                <span className={`font-bold uppercase flex items-center gap-1 ${pago.status === 'PAGADO' ? 'text-green-700' : 'text-orange-500'}`}>
                                    {pago.status} {pago.status === 'PAGADO' && <FaCheckCircle />}
                                </span>
                            </div>
                        </div>

                        {/* Imagen del Comprobante */}
                        <div className="mt-4 border-t pt-3 border-green-200">
                            <p className="text-xs text-gray-600 uppercase font-semibold mb-2">Comprobante</p>
                            {comprobanteUrl ? (
                                <a href={comprobanteUrl} target="_blank" rel="noreferrer" className="block border rounded-lg overflow-hidden transition-shadow hover:shadow-md">
                                    <img 
                                        src={comprobanteUrl} 
                                        alt="Comprobante de pago" 
                                        className="w-full h-32 object-contain bg-white"
                                    />
                                </a>
                            ) : (
                                <div className="bg-gray-100 p-4 rounded text-center text-gray-500 text-xs">
                                    No hay imagen de comprobante.
                                </div>
                            )}
                        </div>
                    </div>
                )}
                
                <div className="mt-8 text-center">
                    <button 
                        onClick={onClose}
                        className="bg-gray-800 hover:bg-gray-900 text-white font-bold py-2 px-8 rounded-lg shadow-lg"
                    >
                        Cerrar
                    </button>
                </div>
            </div>
        </div>
    );
};