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

        if (response.data.access_token) {
            localStorage.setItem('authToken', response.data.access_token);
        }

        return response.data;
    } catch (error) {
        console.error("Error al iniciar sesión:", error);
        throw error;
    }
};

// Sorteo API calls
export const createSorteo = async (sorteoData) => {
    try {
        const response = await api.post("/sorteos/create", sorteoData, {
            headers: {
                'Content-Type': 'multipart/form-data',
            }
        });
        return response.data;
    } catch (error) {
        console.error("Error creando sorteo:", error);
        throw error;
    }
};

// Relacionado con la autenticación y manejo de tokens
api.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem('authToken') || sessionStorage.getItem('authToken');

        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }

        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

api.interceptors.response.use(
    (response) => response,
    (error) => {
        if (error.response?.status === 401) {
            console.warn("Sesión expirada o no autorizada");
        }
        return Promise.reject(error);
    }
);

// Función para cerrar sesión
export const logout = () => {
    localStorage.removeItem('authToken');
    sessionStorage.removeItem('authToken');
};

// Función para verificar si hay sesión activa
export const isAuthenticated = () => {
    return !!(localStorage.getItem('authToken') || sessionStorage.getItem('authToken'));
};