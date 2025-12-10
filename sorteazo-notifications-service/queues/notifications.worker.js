import { Worker } from "bullmq";
import { connection } from "./notifications.queue.js";
import { EmailTransporterFactory } from "../factory/email-transporter.factory.js";
import { TransporterConfig } from "../config/transporter.config.js";
import { EmailService } from "../services/email.service.js";
import { renderTemplate } from "../utils/render-template.js";
import "dotenv/config.js";

const transporterConfig = new TransporterConfig({
    service: "gmail",
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
});

const transporter = EmailTransporterFactory.create(transporterConfig);
const emailService = new EmailService(transporter);

export function startNotificationWorker() {
    const worker = new Worker(
        "notifications",
        async (job) => {

            const { template, destinatarios, ...variables } = job.data;

            variables.fechaProgramada = new Date(job.data.fecha_envio).toLocaleString("es-MX");

            const html = renderTemplate(template, variables);

            await emailService.sendEmail({
                to: destinatarios,
                subject: variables.titulo || "Notificación",
                html
            });
        },
        { connection }
    );

    worker.on("completed", (job) => {
        console.log(`Job ${job.id} completed`);
    });

    worker.on("failed", (job, err) => {
        console.error(`Job ${job.id} failed`, err);
    });

    console.log("Notification worker listening...");
}
