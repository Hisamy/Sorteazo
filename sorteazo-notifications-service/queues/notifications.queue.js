import { Queue } from "bullmq";
import Redis from "ioredis";

const {
  REDIS_URL = "redis://redis:6379",
  REDIS_HOST = "127.0.0.1",
  REDIS_PORT = "6379",
  REDIS_PASSWORD,
  REDIS_DB,
  REDIS_TLS = "false",
  REDIS_MAX_RETRIES_PER_REQUEST,
  REDIS_ENABLE_READY_CHECK,
  QUEUE_NAME = "notifications",
} = process.env;

let connectionOptions;

if (REDIS_URL) {
  connectionOptions = REDIS_URL;
} else {
  const opts = {
    host: REDIS_HOST,
    port: Number(REDIS_PORT),
    maxRetriesPerRequest:
      REDIS_MAX_RETRIES_PER_REQUEST != null
        ? Number(REDIS_MAX_RETRIES_PER_REQUEST)
        : null,
    enableReadyCheck:
      REDIS_ENABLE_READY_CHECK != null
        ? REDIS_ENABLE_READY_CHECK === "true"
        : false,
  };

  if (REDIS_PASSWORD) opts.password = REDIS_PASSWORD;
  if (REDIS_DB) opts.db = Number(REDIS_DB);
  if (REDIS_TLS === "true") opts.tls = {}; 

  connectionOptions = opts;
}

export const connection = new Redis(connectionOptions);

export const notificationQueue = new Queue(QUEUE_NAME, {
  connection,
});
