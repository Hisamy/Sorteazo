import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import Swal from 'sweetalert2';

/**
 * Genera un reporte PDF con estilo corporativo.
 * @param {Array} data - Array de objetos con los datos (JSON del backend).
 * @param {string} reportTitle - Título principal del reporte.
 * @param {string} fileName - Nombre del archivo al descargar (sin extensión).
 */
export const generarPDF = (data, reportTitle, fileName) => {
    if (!data || !Array.isArray(data) || data.length === 0) {
        Swal.fire({
            icon: 'info',
            title: 'Sin datos',
            text: 'No hay información disponible para generar este reporte.'
        });
        return;
    }

    const doc = new jsPDF();
    const pageWidth = doc.internal.pageSize.width;
    const brandColor = [22, 163, 74]; // Tu verde de Tailwind (green-600)

    // --- ENCABEZADO ---
    doc.setFontSize(20);
    doc.setTextColor(...brandColor);
    doc.setFont("helvetica", "bold");
    doc.text("Sorteazo", 14, 20);

    // Título del Reporte
    doc.setFontSize(14);
    doc.setTextColor(40, 40, 40);
    doc.setFont("helvetica", "normal");
    doc.text(reportTitle, 14, 30);

    // Fecha de emisión
    doc.setFontSize(10);
    doc.setTextColor(100, 100, 100); // Gris claro
    const fecha = new Date().toLocaleDateString('es-MX', {
        year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit'
    });
    doc.text(`Generado el: ${fecha}`, 14, 38);

    // Línea divisoria
    doc.setDrawColor(...brandColor);
    doc.setLineWidth(0.5);
    doc.line(14, 42, pageWidth - 14, 42);


    // Obtener las llaves del primer objeto para las columnas
    const rawKeys = Object.keys(data[0]);

    const formatHeader = (str) => {
        return str
            .replace(/([A-Z])/g, ' $1')
            .replace(/^./, (str) => str.toUpperCase());
    };

    const columns = rawKeys.map(key => ({
        header: formatHeader(key),
        dataKey: key
    }));

    // Formatear filas (Moneda, Nulos, Fechas)
    const body = data.map(row => {
        const newRow = { ...row };
        Object.keys(newRow).forEach(key => {
            const val = newRow[key];

            // Si es nulo o undefined
            if (val === null || val === undefined) {
                newRow[key] = '-';
            }
            // Si parece dinero (contiene 'precio', 'monto', 'total', 'recaudado') y es número
            else if (['price', 'precio', 'monto', 'total', 'amount', 'recaudado'].some(k => key.toLowerCase().includes(k)) && !isNaN(val)) {
                newRow[key] = `$${Number(val).toFixed(2)}`;
            }
            // Convertir booleanos
            else if (typeof val === 'boolean') {
                newRow[key] = val ? 'Sí' : 'No';
            }
        });
        return newRow;
    });

    // --- TABLA ---
    autoTable(doc, {
        columns: columns,
        body: body,
        startY: 50,
        theme: 'grid',
        headStyles: {
            fillColor: brandColor,
            textColor: 255,
            fontStyle: 'bold',
            halign: 'center'
        },
        styles: {
            fontSize: 9,
            cellPadding: 3,
            valign: 'middle',
            overflow: 'linebreak'
        },
        columnStyles: {

        },
        alternateRowStyles: {
            fillColor: [240, 253, 244]
        }
    });

    // --- PIE DE PÁGINA ---
    const pageCount = doc.internal.getNumberOfPages();
    for (let i = 1; i <= pageCount; i++) {
        doc.setPage(i);
        doc.setFontSize(8);
        doc.setTextColor(150);
        doc.text(
            `Página ${i} de ${pageCount}`,
            pageWidth - 20,
            doc.internal.pageSize.height - 10,
            { align: 'right' }
        );
    }

    // 3. Guardar archivo
    doc.save(`${fileName}.pdf`);
};