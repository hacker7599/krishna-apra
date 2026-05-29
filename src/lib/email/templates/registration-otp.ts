import { escapeHtml } from "@/lib/email/escape-html";
import { emailHeading, emailInfoBox, emailParagraph, renderEmailLayout } from "@/lib/email/templates/layout";

export type RegistrationOtpEmailData = {
  playerName: string;
  otp: string;
  expiresMinutes?: number;
};

export function registrationOtpSubject(): string {
  return "Your verification code · Future Star U-15";
}

export function renderRegistrationOtpEmail(data: RegistrationOtpEmailData): { html: string; text: string } {
  const name = escapeHtml(data.playerName);
  const otp = escapeHtml(data.otp);
  const expires = data.expiresMinutes ?? 10;

  const bodyHtml = `
    ${emailHeading("Verify your registration")}
    ${emailParagraph(`Hi <strong style="color:#0c1f3d;">${name}</strong>,`)}
    ${emailParagraph("Use this one-time code to view your registration and payment details on the Future Star U-15 website.")}
    ${emailInfoBox(`
      <p style="margin:0 0 8px;font-size:11px;font-weight:700;letter-spacing:0.18em;text-transform:uppercase;color:#64748b;text-align:center;">Verification code</p>
      <p style="margin:0;font-size:40px;font-weight:800;font-family:ui-monospace,Menlo,Consolas,monospace;color:#0c1f3d;letter-spacing:0.35em;text-align:center;line-height:1;">${otp}</p>
    `)}
    ${emailParagraph(`This code expires in <strong>${expires} minutes</strong>. If you did not request it, you can safely ignore this email.`)}
    <p style="margin:24px 0 0;padding:14px 16px;background-color:#fff7ed;border-radius:8px;font-size:13px;line-height:1.5;color:#9a3412;border:1px solid #fed7aa;">
      <strong>Security tip:</strong> Never share this code with anyone. Our team will never ask for it by phone or message.
    </p>
  `;

  const html = renderEmailLayout({
    title: "Verification code",
    preheader: `Your code is ${data.otp}. Valid for ${expires} minutes.`,
    bodyHtml,
  });

  const text = [
    `Hi ${data.playerName},`,
    "",
    `Your verification code: ${data.otp}`,
    `Valid for ${expires} minutes.`,
    "",
    "— Future Star U-15 Championship",
  ].join("\n");

  return { html, text };
}
