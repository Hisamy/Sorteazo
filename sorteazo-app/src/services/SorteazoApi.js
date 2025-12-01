import axios from "axios";


const api = axios.create({
    baseURL: import.meta.env.VITE_API_URL,
    withCredentials: true,
});

export const createUsuario = async (usuarioData) => {
    try {
        const response = await api.post("/users/register/client", usuarioData);
        return response.data;
    } catch (error) {
        console.error("Error creando usuario:", error);
        throw error;
    }
};

export const obtenerUsuario = async (usuarioData) => {
    try {
        const response = await api.post("/users/login", usuarioData);
        return response.data;
    } catch (error) {
        console.error("Error al iniciar sesión:", error);
        throw error;
    }
};

// Obtener el usuario actual autenticado (desde JWT en cookies)
export const obtenerUsuarioActual = async () => {
    try {
        const response = await api.get("/users/profile/me");
        return response.data;
    } catch (error) {
        console.error("Error al obtener usuario actual:", error);
        return null;
    }
};

export const obtenerTodosLosSorteos = async () => {
    try {
        const response = await api.get("/sorteos");
        return response.data;
    } catch (error) {
        console.error("Error al obtener los sorteos:", error);
        throw error;
    }
};

export const obtenerSorteosPorOrganizador = async () => {
    try {
        const response = await api.get("/sorteos/organizador/mis-sorteos");
        return response.data;
    } catch (error) {
        console.error("Error al obtener los sorteos del organizador:", error);
        throw error;
    }
};

export const createSorteo = async (sorteoData) => {
    try {
        const response = await api.post("/sorteos", sorteoData, {
            headers: {
                'Content-Type': 'multipart/form-data',
            },
        });
        return response.data;
    } catch (error) {
        console.error("Error al crear el sorteo:", error);
        throw error;
    }
};

export const obtenerSorteoPorId = async (id) => {
    try {
        const response = await api.get(`/sorteos/${id}`);
        return response.data;
    } catch (error) {
        console.error(`Error al obtener el sorteo con ID ${id}:`, error);
        throw error;
    }
};

export const obtenerBoletosPorSorteoCliente = async (sorteoId) => {
    try {
        const response = await api.get(`/boletos/${sorteoId}`);
        return response.data;
    } catch (error) {
        console.error(`Error al obtener los boletos del sorteo ${sorteoId}:`, error);
        throw error;
    }
};

export const obtenerBoletosPorSorteoOrganizador = async (sorteoId) => {
    try {
        const response = await api.get(`/boletos/organizador/${sorteoId}`);
        return response.data;
    } catch (error) {
        console.error(`Error al obtener los boletos del sorteo ${sorteoId} para el organizador:`, error);
        throw error;
    }
};

export const apartarBoletosPorCliente = async (sorteoId, seleccionados) => {
    try {
        const response = await api.patch("/boletos/reserve", {
            sorteoId: sorteoId,
            numbers: seleccionados
        });

        return response.data;
    } catch (error) {
        console.error(`Ocurrió un error al apartar los números, intente de nuevo más tarde.`, error);
        throw error;
    }
}