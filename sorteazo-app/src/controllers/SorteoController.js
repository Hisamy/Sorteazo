import { createSorteo } from '../services/SorteazoApi.js';
import { editarSorteo } from '../services/SorteazoApi.js';
import { eliminarSorteo } from '../services/SorteazoApi.js';
import { obtenerSorteoPorId } from '../services/SorteazoApi.js';

export const crearSorteo = (formData) => createSorteo(formData);

export const editaSorteo = (formData) => editarSorteo(formData);

export const eliminaSorteo = (formData) => eliminarSorteo(formData);

export const obtenerSorteoId = (formData) => obtenerSorteoPorId(formData);