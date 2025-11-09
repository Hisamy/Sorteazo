import { createUsuario } from "../services/SorteazoApi";

export const registrarUsuario = async (formData) => {
    if (formData.password !== formData.confirmarPassword) {
        throw new Error("Las contraseñas no coinciden");
    }

    if (!formData.email || !formData.name) {
        throw new Error("El nombre y el correo son obligatorios");
    }
    try {
        return response;
    } catch (error) {
        if (error.response) {
            const status = error.response.status;
            const message =
                error.response.data?.message ||
                (status === 400
                    ? "Datos inválidos"
                    : status === 409
                        ? "El usuario ya existe"
                        : "Error en el servidor");
            throw new Error(message);
        }

        throw new Error("No se pudo conectar con el servidor");
    }
};

export const obtenerUsuario = async (formData) => {

    try {
        const response = await createUsuario(formData);
        return response;
    } catch (error) {
        if (error.response) {
            const status = error.response.status;
            const message =
                error.response.data?.message ||
                (status === 400 ? "Credenciales inválidas" : "Error al iniciar sesión");
            throw new Error(message);
        }

        throw new Error("No se pudo conectar con el servidor");
    }
};
