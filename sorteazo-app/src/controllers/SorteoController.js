import {
    createSorteo,
    editarSorteo,
    eliminarSorteo,
    obtenerSorteoPorId,
    editarPremiosSorteo,
    editarBoletosSorteo,
    actualizarConfigRecordatorios,
    obtenerReporteHistorico,
    obtenerReporteDeudores,
    obtenerReporteEstadoBoletos
} from '../services/SorteazoApi.js';

export const crearSorteo = (formData) => createSorteo(formData);

export const editaSorteo = (sorteoId, datosActualizados) => editarSorteo(sorteoId, datosActualizados);

export const editaBoletosSorteo = (sorteoId, datosActualizados) => editarBoletosSorteo(sorteoId, datosActualizados);

export const editaPremiosSorteo = (sorteoId, premiosData) => editarPremiosSorteo(sorteoId, premiosData);

export const eliminaSorteo = (formData) => eliminarSorteo(formData);

export const obtenerSorteoId = (formData) => obtenerSorteoPorId(formData);

export const actualizaConfigRecordatorios = (sorteoId, configData) => actualizarConfigRecordatorios(sorteoId, configData);

export const getReporteHistorico = () => obtenerReporteHistorico();

export const getReporteDeudores = (sorteoId) => obtenerReporteDeudores(sorteoId);

export const getReporteEstado = (sorteoId) => obtenerReporteEstadoBoletos(sorteoId);