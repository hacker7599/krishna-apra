/**
 * SMTP settings — credentials live only in environment variables (never in code or logs).
 * `.env` is gitignored via `.env*` in .gitignore.
 */

export type SmtpConfig = {
  host: string;
  port: number;
  secure: boolean;
  user: string;
  password: string;
  fromEmail: string;
  fromName: string;
  replyTo?: string;
};

function env(name: string): string {
  return process.env[name]?.trim() ?? "";
}

/** True when minimum SMTP settings are present to send mail. */
export function isSmtpConfigured(): boolean {
  return Boolean(env("SMTP_HOST") && env("SMTP_USER") && env("SMTP_PASSWORD") && env("SMTP_FROM"));
}

export function getSmtpConfig(): SmtpConfig {
  const host = env("SMTP_HOST");
  const user = env("SMTP_USER");
  const password = env("SMTP_PASSWORD");
  const fromEmail = env("SMTP_FROM");

  if (!host || !user || !password || !fromEmail) {
    throw new Error("SMTP is not configured. Set SMTP_HOST, SMTP_USER, SMTP_PASSWORD, and SMTP_FROM in .env.");
  }

  const portRaw = env("SMTP_PORT");
  const port = portRaw ? Number.parseInt(portRaw, 10) : 587;
  if (!Number.isFinite(port) || port < 1 || port > 65535) {
    throw new Error("SMTP_PORT must be a valid port number.");
  }

  const secureEnv = env("SMTP_SECURE").toLowerCase();
  const secure = secureEnv === "true" || secureEnv === "1" || port === 465;

  const fromName = env("SMTP_FROM_NAME") || "Future Star U-15";
  const replyTo = env("SMTP_REPLY_TO") || undefined;

  return {
    host,
    port,
    secure,
    user,
    password,
    fromEmail,
    fromName,
    replyTo,
  };
}

/** Safe summary for diagnostics — never includes password. */
export function smtpConfigSummary(): Record<string, string | number | boolean> {
  if (!isSmtpConfigured()) {
    return { configured: false };
  }
  try {
    const c = getSmtpConfig();
    return {
      configured: true,
      host: c.host,
      port: c.port,
      secure: c.secure,
      user: c.user.replace(/^(.{2}).+(@.+)$/, "$1***$2"),
      from: c.fromEmail,
    };
  } catch {
    return { configured: false };
  }
}
