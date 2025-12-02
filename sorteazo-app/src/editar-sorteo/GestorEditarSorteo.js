export const gestorEditarSorteo = (form, initialData) => {
    const formData = new FormData(form);

    const datosActualizados = {};
    const errores = {};

    const title = formData.get('title')?.trim();
    if (title) {
        if (title.length < 3) {
            errores.title = "El título debe tener al menos 3 caracteres";
        } else if (title.length > 100) {
            errores.title = "El título no puede exceder 100 caracteres";
        } else {
            datosActualizados.title = title;
        }
    }

    const description = formData.get('description')?.trim();
    if (description) {
        if (description.length > 500) {
            errores.description = "La descripción no puede exceder 500 caracteres";
        } else {
            datosActualizados.description = description;
        }
    }

    const startDate = formData.get('startDate');
    const endDate = formData.get('endDate');
    const raffleDate = formData.get('raffleDate');

    if (startDate && endDate && raffleDate) {
        const inicio = new Date(startDate);
        const fin = new Date(endDate);
        const sorteo = new Date(raffleDate);

        // Validar que las fechas
        if (fin < inicio) {
            errores.endDate = "La fecha de fin debe ser posterior a la fecha de inicio";
        }

        if (sorteo < fin) {
            errores.raffleDate = "La fecha del sorteo debe ser posterior a la fecha de fin de venta";
        }

        if (!errores.endDate && !errores.raffleDate) {
            datosActualizados.saleStartDate = new Date(startDate + 'T00:00:00').toISOString();
            datosActualizados.saleEndDate = new Date(endDate + 'T00:00:00').toISOString();
            datosActualizados.raffleDateTime = new Date(raffleDate + 'T00:00:00').toISOString();
        }
    }

    const paymentDeadline = formData.get('paymentDeadline');
    if (paymentDeadline) {
        const dias = parseInt(paymentDeadline);
        if (isNaN(dias) || dias < 1) {
            errores.paymentDeadline = "El plazo de pago debe ser al menos 1 día";
        } else if (dias > 365) {
            errores.paymentDeadline = "El plazo de pago no puede exceder 365 días";
        } else {
            datosActualizados.paymentDeadlineDays = dias;
        }
    }

    const imageFile = formData.get('image');
    if (imageFile && imageFile.size > 0) {
        const maxSize = 5 * 1024 * 1024;
        if (imageFile.size > maxSize) {
            errores.image = "La imagen no puede pesar más de 5MB";
        } else {
            const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
            if (!allowedTypes.includes(imageFile.type)) {
                errores.image = "Solo se permiten imágenes JPG, PNG o WebP";
            } else {
                datosActualizados.imagenSorteo = imageFile;
            }
        }
    } else if (initialData?.imageUrl) {
        datosActualizados.imageUrl = initialData.imageUrl;
    }

    console.log("Datos procesados por gestor:", datosActualizados);

    if (Object.keys(errores).length > 0) {
        console.error("Errores de validación:", errores);
        throw {
            type: 'VALIDATION_ERROR',
            errors: errores
        };
    }

    return datosActualizados;
};