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

export const editarSorteo = async (sorteoId, datosActualizados) => {
    try {
        if (!datosActualizados || typeof datosActualizados !== 'object') {
            throw new Error('Los datos actualizados son inválidos');
        }

        const formData = new FormData();

        Object.keys(datosActualizados).forEach(key => {
            if (key === 'imagenSorteo' && datosActualizados[key] instanceof File) {
                formData.append('imagenSorteo', datosActualizados[key]);
            }
            else if (typeof datosActualizados[key] === 'object' && datosActualizados[key] !== null && !(datosActualizados[key] instanceof File)) {
                formData.append(key, JSON.stringify(datosActualizados[key]));
            }
            else if (datosActualizados[key] !== null && datosActualizados[key] !== undefined && !(datosActualizados[key] instanceof File)) {
                formData.append(key, datosActualizados[key]);
            }
        });

        console.log("FormData a enviar:", Array.from(formData.entries())); // Para debug

        const response = await api.patch(`/sorteos/${sorteoId}`, formData, {
            headers: {
                'Content-Type': 'multipart/form-data',
            },
        });

        return response.data;
    } catch (error) {
        console.error(`Ocurrió un error al editar sorteo, intentelo más tarde`, error);
        throw error;
    }
}

export const editarBoletosSorteo = async (sorteoId, datosActualizados) => {
    try {
        const formData = new FormData();

        Object.keys(datosActualizados).forEach(key => {
            if (datosActualizados[key] !== null && datosActualizados[key] !== undefined) {
                formData.append(key, datosActualizados[key]);
            }
        });

        const response = await api.patch(`/sorteos/${sorteoId}/boletos`, formData, {
            headers: {
                'Content-Type': 'multipart/form-data'
            }
        });
        return response.data;
    } catch (error) {
        console.error(`Error al editar boletos del sorteo`, error);
        throw error;
    }
}

export const editarPremiosSorteo = async (sorteoId, premiosData) => {
    try {
        const formData = new FormData();

        const premiosSinImagenes = premiosData.premios.map(premio => ({
            id: premio.id,
            name: premio.name,
            place: premio.place,
            description: premio.description,
            ...(premio.imageUrl && !premio.imageFile && { imageUrl: premio.imageUrl })
        }));

        formData.append('premios', JSON.stringify(premiosSinImagenes));

        premiosData.premios.forEach((premio) => {
            if (premio.imageFile) {
                formData.append('imagenesPremios', premio.imageFile);
            }
        });

        const response = await api.patch(`/sorteos/${sorteoId}/premios`, formData, {
            headers: {
                'Content-Type': 'multipart/form-data',
            },
        });

        return response.data;
    } catch (error) {
        console.error(`Error al editar premios del sorteo`, error);
        throw error;
    }
}

export const eliminarSorteo = async (sorteoId) => {
    try {
        const response = await api.delete(`/sorteos/${sorteoId}`);

        return response.data;
    } catch (error) {
        console.error(`Ocurrió un error al eliminar sorteo, intentelo más tarde`, error);
        throw error;
    }
}