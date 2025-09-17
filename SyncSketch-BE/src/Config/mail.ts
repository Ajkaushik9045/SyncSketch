import nodemailer, { type Transporter } from "nodemailer";
import { config } from "./env";

export const mailTransporter: Transporter = nodemailer.createTransport({
    host: config.mail.host,
    port: config.mail.port,
    // secure: config.mail.secure,
    auth: {
        user: config.mail.user,
        pass: config.mail.pass,
    },
});
