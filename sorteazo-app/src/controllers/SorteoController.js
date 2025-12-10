import { createSorteo } from '../services/SorteazoApi.js';
import { editarSorteo } from '../services/SorteazoApi.js';
import { eliminarSorteo } from '../services/SorteazoApi.js';
import { obtenerSorteoPorId } from '../services/SorteazoApi.js';
import { editarPremiosSorteo } from '../services/SorteazoApi.js';
import { editarBoletosSorteo } from '../services/SorteazoApi.js';
import { actualizarConfigRecordatorios } from '../services/SorteazoApi.js';

export const crearSorteo = (formData) => createSorteo(formData);

export const editaSorteo = (sorteoId, datosActualizados) => editarSorteo(sorteoId, datosActualizados);

export const editaBoletosSorteo = (sorteoId, datosActualizados) => editarBoletosSorteo(sorteoId, datosActualizados);

export const editaPremiosSorteo = (sorteoId, premiosData) => editarPremiosSorteo(sorteoId, premiosData);

export const eliminaSorteo = (formData) => eliminarSorteo(formData);

export const obtenerSorteoId = (formData) => obtenerSorteoPorId(formData);

export const actualizaConfigRecordatorios = (sorteoId, configData) => actualizarConfigRecordatorios(sorteoId, configData);