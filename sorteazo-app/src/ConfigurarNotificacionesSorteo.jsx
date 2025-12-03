import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { FaArrowLeft, FaEnvelopeOpenText, FaClock, FaCalendarAlt, FaSave, FaInfoCircle, FaRegCalendarCheck } from "react-icons/fa";
import Swal from 'sweetalert2';

export function ConfigurarNotificacionesSorteo() {
    const navigate = useNavigate();

    const [config, setConfig] = useState({
        frequencyDays: 3,
        sendTime: "09:00",
        subject: "Recordatorio: Tu boleto te espera ",
        body: "Hola {nombre},\n\nNotamos que tienes boletos apartados en el sorteo. Recuerda que tienes hasta el {fecha_limite} para realizar tu pago y asegurar tu participación.\n\nTotal a pagar: ${total}\n\nPuedes pagar aquí: {link_pago}\n\n¡No te quedes fuera!"
    });

    // Datos simulados para la vista previa
    const previewData = {
        nombre: "Carlos Ruiz",
        boletos: "2",
        total: "100.00",
        fecha_limite: "20/12/2025",
        link_pago: "https://sorteazo.com/p/123"
    };

    const getPreviewText = (text) => {
        let preview = text || "";
        Object.keys(previewData).forEach(key => {
            const regex = new RegExp(`{${key}}`, 'g');
            preview = preview.replace(regex, previewData[key]);
        });
        return preview;
    };

    const handleSave = (e) => {
        e.preventDefault();

        Swal.fire({
            title: '¿Confirmar cambios?',
            html: `Se enviará un correo recordatorio <b>cada ${config.frequencyDays} días</b> a las <b>${config.sendTime} hrs</b>.`,
            icon: 'question',
            showCancelButton: true,
            confirmButtonColor: '#6B8E78',
            confirmButtonText: 'Guardar Configuración',
            cancelButtonText: 'Cancelar'
        }).then((result) => {
            if (result.isConfirmed) {
                //  (PATCH /api/sorteos/:id/config-recordatorios)
                console.log("Guardando:", config);
                Swal.fire('¡Configurado!', 'Tus preferencias de envío han sido actualizadas.', 'success');
            }
        });
    };

    return (
        <div className="min-h-screen bg-[var(--color-background)] p-8 font-afacad">
            <div className="max-w-6xl mx-auto">

                <div className="flex items-center gap-4 mb-8">
                    <button onClick={() => navigate(-1)} className="text-gray-500 hover:text-gray-800 transition-colors p-2 rounded-full hover:bg-gray-100">
                        <FaArrowLeft size={18} />
                    </button>
                    <div>
                        <h1 className="text-3xl font-bold text-[var(--color-dark-text)]">
                            Frecuencia de Recordatorios
                        </h1>
                        <p className="text-gray-500">Configura cada cuánto tiempo el sistema enviará avisos a los clientes pendientes de pago.</p>
                    </div>
                </div>

                <form onSubmit={handleSave} className="grid grid-cols-1 lg:grid-cols-12 gap-8">

                    {/* PANEL IZQUIERDO: Configuración */}
                    <div className="lg:col-span-7 space-y-6">

                        {/* 1. TARJETA DE FRECUENCIA Y HORARIO */}
                        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                            <h3 className="text-lg font-bold text-gray-800 mb-6 flex items-center gap-2 pb-4 border-b border-gray-100">
                                <FaClock className="text-[var(--color-primary)]" />
                                Intervalo de Envío
                            </h3>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                {/* Frecuencia */}
                                <div>
                                    <label className="block text-sm font-bold text-gray-700 mb-3 flex items-center gap-2">
                                        <FaCalendarAlt className="text-gray-400" />
                                        Repetición (Días)
                                    </label>
                                    <div className="flex items-center">
                                        <div className="relative flex-1">
                                            <input
                                                type="number"
                                                min="1" max="15"
                                                value={config.frequencyDays}
                                                onChange={(e) => setConfig({ ...config, frequencyDays: e.target.value })}
                                                className="w-full pl-4 pr-12 py-3 border-2 border-gray-200 rounded-lg font-bold text-lg text-gray-700 focus:border-[var(--color-primary)] focus:outline-none transition-colors text-center"
                                            />
                                            <span className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400 text-sm font-medium pointer-events-none">
                                                días
                                            </span>
                                        </div>
                                    </div>
                                    <p className="text-xs text-gray-400 mt-2">
                                        Se enviará un correo cada {config.frequencyDays} días hasta que el boleto sea pagado o liberado.
                                    </p>
                                </div>

                                {/* Hora Específica */}
                                <div>
                                    <label className="block text-sm font-bold text-gray-700 mb-3 flex items-center gap-2">
                                        <FaClock className="text-gray-400" />
                                        Hora de Ejecución
                                    </label>
                                    <input
                                        type="time"
                                        value={config.sendTime}
                                        onChange={(e) => setConfig({ ...config, sendTime: e.target.value })}
                                        className="w-full py-3 px-4 border-2 border-gray-200 rounded-lg font-bold text-lg text-gray-700 focus:border-[var(--color-primary)] focus:outline-none transition-colors cursor-pointer"
                                    />
                                    <p className="text-xs text-gray-400 mt-2">
                                        Los correos saldrán puntualmente a esta hora local.
                                    </p>
                                </div>
                            </div>
                        </div>

                        {/* 2. EDITOR DE CONTENIDO */}
                        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex-grow">
                            <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
                                <FaEnvelopeOpenText className="text-[var(--color-primary)]" />
                                Personalización del Correo
                            </h3>

                            <div className="space-y-5">
                                <div>
                                    <label className="block text-sm font-semibold text-gray-600 mb-1">Asunto del Correo</label>
                                    <input
                                        type="text"
                                        value={config.subject}
                                        onChange={(e) => setConfig({ ...config, subject: e.target.value })}
                                        className="w-full p-3 bg-gray-50 border border-gray-200 rounded-lg focus:bg-white focus:outline-none focus:border-[var(--color-primary)] focus:ring-1 focus:ring-[var(--color-primary)] transition-all"
                                        placeholder="Ej: Recordatorio de pago..."
                                    />
                                </div>

                                <div>
                                    <div className="flex justify-between items-center mb-1">
                                        <label className="block text-sm font-semibold text-gray-600">Mensaje</label>
                                    </div>
                                    <textarea
                                        rows="8"
                                        value={config.body}
                                        onChange={(e) => setConfig({ ...config, body: e.target.value })}
                                        className="w-full p-4 bg-gray-50 border border-gray-200 rounded-lg focus:bg-white focus:outline-none focus:border-[var(--color-primary)] focus:ring-1 focus:ring-[var(--color-primary)] transition-all resize-none font-sans text-sm leading-relaxed"
                                    ></textarea>
                                </div>

                                {/* Variables Cheatsheet (Compacto) */}
                                <div className="flex flex-wrap gap-2 text-xs text-gray-500 pt-2 border-t border-gray-100">
                                    <span className="font-semibold text-[var(--color-primary)]">Variables:</span>
                                    {['{nombre}', '{boletos}', '{total}', '{fecha_limite}', '{link_pago}'].map(tag => (
                                        <span key={tag} className="bg-gray-100 px-2 py-0.5 rounded border border-gray-200 cursor-help" title="Se reemplazará automáticamente">
                                            {tag}
                                        </span>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* PANEL DERECHO: Vista Previa Fija */}
                    <div className="lg:col-span-5">
                        <div className="sticky top-6">
                            <div className="flex items-center justify-between mb-4">
                                <h3 className="text-sm font-bold text-gray-500 uppercase tracking-wide">
                                    Vista Previa
                                </h3>
                                <span className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded-full font-bold">
                                    Activo Automáticamente
                                </span>
                            </div>

                            {/* Card de Email */}
                            <div className="bg-white border border-gray-200 rounded-xl shadow-lg overflow-hidden flex flex-col min-h-[500px]">
                                {/* Cabecera Gmail-like */}
                                <div className="bg-gray-50 p-5 border-b border-gray-100">
                                    <h4 className="font-bold text-lg text-gray-800 mb-1 truncate">{config.subject || "(Sin asunto)"}</h4>
                                    <div className="flex items-center gap-3 mt-3">
                                        <div className="w-10 h-10 rounded-full bg-[var(--color-primary)] text-white flex items-center justify-center font-bold text-lg">
                                            S
                                        </div>
                                        <div className="text-sm">
                                            <p className="font-bold text-gray-900">Sorteazo <span className="text-gray-400 font-normal">&lt;no-reply@sorteazo.com&gt;</span></p>
                                            <p className="text-gray-500">para {previewData.nombre}</p>
                                        </div>
                                    </div>
                                </div>

                                {/* Cuerpo */}
                                <div className="p-6 flex-grow text-gray-700 text-sm leading-7 whitespace-pre-wrap font-sans">
                                    {getPreviewText(config.body)}
                                </div>

                                {/* Footer */}
                                <div className="bg-gray-50 p-4 text-center border-t border-gray-100">
                                    <p className="text-xs text-gray-400">
                                        Este correo se enviará automáticamente cada <span className="font-bold text-gray-600">{config.frequencyDays} días</span> a las <span className="font-bold text-gray-600">{config.sendTime}</span>.
                                    </p>
                                </div>
                            </div>

                            <button
                                type="submit"
                                className="w-full mt-6 py-4 rounded-xl bg-[#6B8E78] text-white font-bold text-lg hover:bg-[#5a7a66] hover:shadow-lg transform active:scale-95 transition-all flex items-center justify-center gap-2"
                            >
                                <FaSave /> Actualizar Configuración
                            </button>
                        </div>
                    </div>
                </form>
            </div>
        </div>
    );
}