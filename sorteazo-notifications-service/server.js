import express from "express";
import { notificationQueue } from "./queues/notifications.queue.js";
import { startNotificationWorker } from "./queues/notifications.worker.js";

const app = express();
app.use(express.json());

app.post("/notify", async (req, res) => {
    const { template, destinatarios, fecha_envio } = req.body;

    if (!template || !destinatarios || !fecha_envio) {
        return res.status(400).json({ 
            error: "template, destinatarios y fecha_envio son obligatorios" 
        });
    }

    const fechaEnvio = new Date(fecha_envio);

    if (isNaN(fechaEnvio.getTime())) {
        return res.status(400).json({ error: "fecha_envio inválida" });
    }

    if (fechaEnvio <= new Date()) {
        return res.status(400).json({ error: "La fecha_envio debe ser futura" });
    }

    const job = await notificationQueue.add(
        "sendNotification",
        req.body,
        { delay: fechaEnvio - new Date() }
    );

    return res.json({
        message: "Notificación programada",
        jobId: job.id
    });
});


startNotificationWorker();

const PORT = 3000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
