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