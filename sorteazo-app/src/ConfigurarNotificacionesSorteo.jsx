import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { FaArrowLeft, FaEnvelopeOpenText, FaClock, FaCalendarAlt, FaSave, FaInfoCircle } from "react-icons/fa";
import Swal from 'sweetalert2';
import {
    actualizaConfigRecordatorios,
    obtenerSorteoId
} from './controllers/SorteoController';

export function ConfigurarNotificacionesSorteo() {
    const navigate = useNavigate();
    const { id: sorteoId } = useParams();
    const [loading, setLoading] = useState(true);
    const [sorteoInfo, setSorteoInfo] = useState(null);

    const [config, setConfig] = useState({
        frequencyDays: "",
        sendTime: "",
        subject: "",
        body: ""
    });

    useEffect(() => {
        const cargarDatos = async () => {
            try {
                setLoading(true);
                const sorteoData = await obtenerSorteoId(sorteoId);
                setSorteoInfo(sorteoData);

                if (sorteoData.recordatorioConfig) {
                    let timeFromDb = sorteoData.recordatorioConfig.sendTime || "";
                    if (timeFromDb.length > 5) {
                        timeFromDb = timeFromDb.substring(0, 5);
                    }

                    setConfig({
                        frequencyDays: sorteoData.recordatorioConfig.frequencyDays || "",
                        sendTime: timeFromDb,
                        subject: sorteoData.recordatorioConfig.subject || "",
                        body: sorteoData.recordatorioConfig.body || ""
                    });
                }

            } catch (error) {
                console.error("Error al cargar:", error);
                Swal.fire({ icon: 'error', title: 'Error', text: 'No se pudo cargar la información del sorteo.' });
            } finally {
                setLoading(false);
            }
        };

        if (sorteoId) cargarDatos();
    }, [sorteoId]);

    const getPreviewData = () => {
        if (!sorteoInfo) return {};

        const tituloSorteo = sorteoInfo.title;
        const precioUnitario = parseFloat(sorteoInfo.ticketPrice || 0);
        let fechaFormateada = "Fecha no definida";

        if (sorteoInfo.saleEndDate) {
            const fechaObj = new Date(sorteoInfo.saleEndDate);

            fechaFormateada = fechaObj.toLocaleDateString('es-MX', {
                day: 'numeric',
                month: 'long',
                year: 'numeric'
            });
        }

        return {
            sorteo: tituloSorteo,
            costo_boleto: precioUnitario,
            fecha_limite: fechaFormateada,
        };
    };

    const getPreviewText = (text) => {
        if (!text) return "";
        let preview = text;
        const data = getPreviewData();
        Object.keys(data).forEach(key => {
            const regex = new RegExp(`{${key}}`, 'g');
            preview = preview.replace(regex, data[key]);
        });
        return preview;
    };

    const handleSave = async (e) => {
        e.preventDefault();

        if (!config.frequencyDays || !config.sendTime || !config.subject || !config.body) {
            Swal.fire('Atención', 'Por favor completa todos los campos para guardar la configuración.', 'warning');
            return;
        }

        const result = await Swal.fire({
            title: '¿Guardar Plantilla Global?',
            html: `Esta configuración se aplicará a <b>todos los clientes</b>.<br/><br/>Se enviará cada <b>${config.frequencyDays} días</b> a las <b>${config.sendTime}</b>.`,
            icon: 'question',
            showCancelButton: true,
            confirmButtonColor: '#6B8E78',
            confirmButtonText: 'Guardar Configuración',
            cancelButtonText: 'Cancelar'
        });

        if (result.isConfirmed) {
            try {
                const datosAEnviar = {
                    frequencyDays: parseInt(config.frequencyDays),
                    sendTime: config.sendTime,
                    subject: config.subject,
                    body: config.body
                };


                Swal.fire({ title: 'Guardando...', didOpen: () => Swal.showLoading() });

                await actualizaConfigRecordatorios(sorteoId, datosAEnviar);

                await Swal.fire({
                    title: '¡Configurado!',
                    text: 'Los recordatorios automáticos han sido activados correctamente.',
                    icon: 'success',
                    confirmButtonColor: '#6B8E78'
                }).then(() => {
                    navigate(-1);
                });

            } catch (error) {
                const msg = error.response?.data?.message || 'No se pudo guardar.';
                Swal.fire('Error', msg, 'error');
            }
        }
    };

    if (loading) return (
        <div className="min-h-screen bg-[var(--color-background)] flex items-center justify-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[var(--color-primary)]"></div>
        </div>
    );

    const previewData = getPreviewData();

    return (
        <div className="min-h-screen bg-[var(--color-background)] p-8 font-afacad">
            <div className="max-w-6xl mx-auto">
                <div className="flex items-center gap-4 mb-8">
                    <button onClick={() => navigate(-1)} className="text-gray-500 hover:bg-gray-100 p-2 rounded-full transition-colors">
                        <FaArrowLeft size={18} />
                    </button>
                    <div>
                        <h1 className="text-3xl font-bold text-[var(--color-dark-text)]">
                            Configuración de Recordatorios
                        </h1>
                        <p className="text-gray-500">
                            Define la <b>plantilla general</b> de correos para el sorteo: <span className="font-semibold">{sorteoInfo?.titulo}</span>
                        </p>
                    </div>
                </div>

                <form onSubmit={handleSave} className="grid grid-cols-1 lg:grid-cols-12 gap-8">

                    {/* IZQUIERDA: EDITOR */}
                    <div className="lg:col-span-7 space-y-6">

                        {/* Frecuencia */}
                        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                            <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
                                <FaClock className="text-[var(--color-primary)]" /> Reglas de Envío
                            </h3>
                            <div className="grid grid-cols-2 gap-6">
                                <div>
                                    <label className="block text-sm font-bold text-gray-700 mb-2">Frecuencia (Días)</label>
                                    <div className="relative">
                                        <input type="number" min="1" max="15" value={config.frequencyDays}
                                            onChange={(e) => setConfig({ ...config, frequencyDays: e.target.value })}
                                            placeholder="Ej. 3"
                                            className="w-full p-3 border-2 border-gray-200 rounded-lg text-center font-bold text-lg focus:border-[var(--color-primary)] focus:outline-none"
                                        />
                                        <span className="absolute right-8 top-1/2 -translate-y-1/2 text-gray-400 text-sm">días</span>
                                    </div>
                                </div>
                                <div>
                                    <label className="block text-sm font-bold text-gray-700 mb-2">Hora de Envío</label>
                                    <input type="time" value={config.sendTime}
                                        onChange={(e) => setConfig({ ...config, sendTime: e.target.value })}
                                        className="w-full p-3 border-2 border-gray-200 rounded-lg font-bold text-lg text-center cursor-pointer focus:border-[var(--color-primary)] focus:outline-none"
                                    />
                                </div>
                            </div>
                            <div className="mt-4 bg-blue-50 text-blue-800 text-xs p-3 rounded-lg flex items-start gap-2">
                                <FaInfoCircle className="mt-0.5 shrink-0" />
                                <p>El sistema revisará todos los boletos apartados cada <b>{config.frequencyDays || "..."} días</b> a las <b>{config.sendTime || "--:--"}</b> y enviará este correo.</p>
                            </div>
                        </div>

                        {/* Editor de Mensaje */}
                        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                            <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
                                <FaEnvelopeOpenText className="text-[var(--color-primary)]" /> Plantilla de Correo
                            </h3>
                            <div className="space-y-4">
                                <div>
                                    <label className="block text-sm font-bold text-gray-700 mb-1">Asunto</label>
                                    <input type="text" value={config.subject}
                                        onChange={(e) => setConfig({ ...config, subject: e.target.value })}
                                        className="w-full p-3 bg-gray-50 border border-gray-200 rounded-lg focus:bg-white focus:border-[var(--color-primary)] outline-none transition-all"
                                        placeholder="Ej: Recordatorio: Tu boleto te espera"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-bold text-gray-700 mb-1">Mensaje General</label>
                                    <textarea rows="8" value={config.body}
                                        onChange={(e) => setConfig({ ...config, body: e.target.value })}
                                        className="w-full p-4 bg-gray-50 border border-gray-200 rounded-lg focus:bg-white focus:border-[var(--color-primary)] outline-none transition-all resize-none text-sm leading-relaxed"
                                        placeholder={`Te recordamos que tienes boletos apartados...\n(Usa las variables de abajo para personalizar)`}
                                    ></textarea>
                                </div>

                                {/* Variables Dinámicas */}
                                <div className="border-t pt-3">
                                    <p className="text-xs font-bold text-gray-500 mb-2">Variables disponibles (se reemplazan automáticamente por los datos del boleto):</p>
                                    <div className="flex flex-wrap gap-2">
                                        {['{sorteo}', '{costo_boleto}', '{fecha_limite}'].map(tag => (
                                            <span key={tag} className="bg-gray-100 border border-gray-200 text-gray-600 px-2 py-1 rounded text-xs font-mono cursor-help" title="Esta variable cambiará por el dato real del cliente">
                                                {tag}
                                            </span>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* DERECHA: PREVIEW */}
                    <div className="lg:col-span-5">
                        <div className="sticky top-6">
                            <div className="mb-3 flex justify-between items-end">
                                <h3 className="text-sm font-bold text-gray-500 uppercase tracking-wide">Vista Previa</h3>
                                <span className="text-xs text-gray-400">Simulación con precio real (${sorteoInfo?.precioBoleto})</span>
                            </div>

                            <div className="bg-white border border-gray-200 rounded-xl shadow-lg overflow-hidden flex flex-col min-h-[450px]">
                                <div className="bg-gray-50 p-5 border-b border-gray-100">
                                    {/* Muestra placeholder si está vacío */}
                                    <h4 className={`font-bold truncate ${!config.subject ? "text-gray-400 italic" : "text-gray-900"}`}>
                                        {config.subject || "(Sin Asunto)"}
                                    </h4>
                                    <div className="flex gap-3 mt-3 items-center">
                                        <div className="w-8 h-8 rounded-full bg-[var(--color-primary)] text-white flex items-center justify-center font-bold">S</div>
                                        <div className="text-xs">
                                            <p className="font-bold text-gray-800">Sorteazo &lt;no-reply@sorteazo.com&gt;</p>
                                            <p className="text-gray-500">para {previewData.nombre}</p>
                                        </div>
                                    </div>
                                </div>

                                <div className="p-6 text-sm text-gray-700 whitespace-pre-wrap leading-relaxed flex-grow font-sans">
                                    {config.body ? getPreviewText(config.body) : (
                                        <span className="text-gray-400 italic">Escribe en el mensaje para ver la vista previa aquí...</span>
                                    )}
                                </div>

                                <div className="bg-gray-50 p-3 text-center border-t border-gray-100">
                                    <p className="text-[10px] text-gray-400 uppercase font-bold tracking-wider">
                                        Plantilla Global aplicada al sorteo
                                    </p>
                                </div>
                            </div>

                            <button type="submit" className="w-full mt-6 bg-[#6B8E78] hover:bg-[#5a7a66] text-white py-4 rounded-xl font-bold text-lg shadow-md hover:shadow-lg transform active:scale-95 transition-all flex items-center justify-center gap-2">
                                <FaSave /> Guardar Configuración
                            </button>
                        </div>
                    </div>

                </form>
            </div>
        </div>
    );
}