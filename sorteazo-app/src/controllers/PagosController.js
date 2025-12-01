import { pagarBoletosTransferencia, pagarBoletosEnLinea, confirmarPago, rechazarPago } from '../services/SorteazoApi.js';

/**
 * Procesa el pago de boletos mediante transferencia bancaria
 * @param {Array<string>} boletoIds - IDs de los boletos a pagar
 * @param {File} comprobanteFile - Archivo de comprobante de pago
 * @returns {Promise} Respuesta del servidor con los pagos registrados
 */
export const procesarPagoTransferencia = async (boletoIds, comprobanteFile) => {
    if (!boletoIds || boletoIds.length === 0) {
        throw new Error("Debes seleccionar al menos un boleto para pagar");
    }

    if (!comprobanteFile) {
        throw new Error("Debes subir un comprobante de pago");
    }

    try {
        const response = await pagarBoletosTransferencia(boletoIds, comprobanteFile);
        return response;
    } catch (error) {
        console.error("Error al procesar pago por transferencia:", error);
        
        if (error.response) {
            const status = error.response.status;
            const message =
                error.response.data?.message ||
                (status === 400
                    ? "Datos inválidos en la solicitud"
                    : status === 401
                        ? "No tienes autorización para realizar esta acción"
                        : status === 404
                            ? "Boleto no encontrado"
                            : status === 409
                                ? "Este boleto ya tiene un pago registrado"
                                : "Error al procesar el pago");
            throw new Error(message);
        }

        throw new Error("No se pudo conectar con el servidor. Verifica tu conexión.");
    }
};

/**
 * Procesa el pago de boletos mediante pago en línea
 * @param {Array<string>} boletoIds - IDs de los boletos a pagar
 * @returns {Promise} Respuesta del servidor con los pagos procesados
 */
export const procesarPagoEnLinea = async (boletoIds) => {
    if (!boletoIds || boletoIds.length === 0) {
        throw new Error("Debes seleccionar al menos un boleto para pagar");
    }

    try {
        const response = await pagarBoletosEnLinea(boletoIds);
        return response;
    } catch (error) {
        console.error("Error al procesar pago en línea:", error);
        
        if (error.response) {
            const status = error.response.status;
            const message =
                error.response.data?.message ||
                (status === 400
                    ? "Datos inválidos en la solicitud"
                    : status === 401
                        ? "No tienes autorización para realizar esta acción"
                        : status === 404
                            ? "Boleto no encontrado"
                            : status === 409
                                ? "Este boleto ya tiene un pago registrado"
                                : "Error al procesar el pago");
            throw new Error(message);
        }

        throw new Error("No se pudo conectar con el servidor. Verifica tu conexión.");
    }
};

/**
 * Confirma un pago pendiente (solo organizadores)
 * @param {string} pagoId - ID del pago a confirmar
 * @returns {Promise} Respuesta del servidor con el pago confirmado
 */
export const aprobarPago = async (pagoId) => {
    if (!pagoId) {
        throw new Error("ID de pago inválido");
    }

    try {
        const response = await confirmarPago(pagoId);
        return response;
    } catch (error) {
        console.error("Error al aprobar pago:", error);
        
        if (error.response) {
            const status = error.response.status;
            const message =
                error.response.data?.message ||
                (status === 401
                    ? "No tienes autorización para aprobar pagos"
                    : status === 403
                        ? "No puedes aprobar pagos de este sorteo"
                        : status === 404
                            ? "Pago no encontrado"
                            : status === 409
                                ? "Este pago ya fue procesado"
                                : "Error al aprobar el pago");
            throw new Error(message);
        }

        throw new Error("No se pudo conectar con el servidor. Verifica tu conexión.");
    }
};

/**
 * Rechaza un pago pendiente (solo organizadores)
 * @param {string} pagoId - ID del pago a rechazar
 * @returns {Promise} Respuesta del servidor con el pago rechazado
 */
export const denegarPago = async (pagoId) => {
    if (!pagoId) {
        throw new Error("ID de pago inválido");
    }

    try {
        const response = await rechazarPago(pagoId);
        return response;
    } catch (error) {
        console.error("Error al rechazar pago:", error);
        
        if (error.response) {
            const status = error.response.status;
            const message =
                error.response.data?.message ||
                (status === 401
                    ? "No tienes autorización para rechazar pagos"
                    : status === 403
                        ? "No puedes rechazar pagos de este sorteo"
                        : status === 404
                            ? "Pago no encontrado"
                            : status === 409
                                ? "Este pago ya fue procesado"
                                : "Error al rechazar el pago");
            throw new Error(message);
        }

        throw new Error("No se pudo conectar con el servidor. Verifica tu conexión.");
    }
};
