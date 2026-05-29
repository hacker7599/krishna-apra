import nodemailer from "nodemailer";
import type Transporter from "nodemailer/lib/mailer";
import { getSmtpConfig } from "@/lib/email/smtp-config";

let transporter: Transporter | null = null;

/** Reuse a single transporter per process (credentials read once from env). */
export function getSmtpTransporter(): Transporter {
  if (transporter) return transporter;

  const cfg = getSmtpConfig();
  transporter = nodemailer.createTransport({
    host: cfg.host,
    port: cfg.port,
    secure: cfg.secure,
    auth: {
      user: cfg.user,
      pass: cfg.password,
    },
    tls: {
      minVersion: "TLSv1.2",
      rejectUnauthorized: process.env.SMTP_TLS_REJECT_UNAUTHORIZED !== "false",
    },
  });

  return transporter;
}

/** Clear cached transporter (e.g. after env change in dev). */
export function resetSmtpTransporter(): void {
  transporter = null;
}
