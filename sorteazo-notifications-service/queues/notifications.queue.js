import { Queue } from "bullmq";
import Redis from "ioredis";

export const connection = new Redis({
    maxRetriesPerRequest: null,
    enableReadyCheck: false,
});

export const notificationQueue = new Queue("notifications", {
    connection,
});
