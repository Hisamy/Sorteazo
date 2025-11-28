
export const gestorEditarSorteo = (formHTML, initialData) => {
    const rawData = new FormData(formHTML);
    const dataToSend = new FormData();

    dataToSend.append('title', rawData.get('title'));
    dataToSend.append('description', rawData.get('description'));
    dataToSend.append('saleStartDate', rawData.get('startDate'));
    dataToSend.append('saleEndDate', rawData.get('endDate'));
    dataToSend.append('paymentDeadlineDays', rawData.get('paymentDeadline'));
    dataToSend.append('raffleDateTime', rawData.get('raffleDate'));

    const imageFile = rawData.get('image');
    if (imageFile instanceof File && imageFile.size > 0) {
        dataToSend.append('imagenSorteo', imageFile);
    } else if (initialData.imageUrl) {
        dataToSend.append('imageUrl', initialData.imageUrl);
    }


    dataToSend.append('ticketPrice', initialData.ticketPrice);
    dataToSend.append('numbersQuantity', initialData.numbersQuantity);
    dataToSend.append('startNumber', initialData.startNumber);


    const premiosOriginales = initialData.premios || initialData.prizes || [];

    const premiosFormateados = premiosOriginales.map(p => ({
        id: p.id,
        name: p.name,
        place: parseInt(p.place),
        description: p.description,
        imageUrl: p.imageUrl || ''
    }));

    dataToSend.append('premios', JSON.stringify(premiosFormateados));

    return dataToSend;
};