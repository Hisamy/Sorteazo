import nodemailer from "nodemailer";
import { TransporterConfig } from "../config/transporter.config.js";

export class EmailTransporterFactory {
  static create(config) {
    if (!(config instanceof TransporterConfig)) {
      throw new Error("Invalid TransporterConfig");
    }

    if (config.service) {
      return nodemailer.createTransport({
        service: config.service,
        auth: {
          user: config.user,
          pass: config.pass,
        },
      });
    }

    return nodemailer.createTransport({
      host: config.host,
      port: config.port,
      secure: config.secure,
      auth: {
        user: config.user,
        pass: config.pass,
      },
    });
  }
}
