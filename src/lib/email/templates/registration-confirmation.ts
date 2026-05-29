import { escapeHtml } from "@/lib/email/escape-html";
import {
  emailButton,
  emailHeading,
  emailInfoBox,
  emailParagraph,
  emailTextLink,
  renderEmailLayout,
} from "@/lib/email/templates/layout";

export type RegistrationConfirmationEmailData = {
  playerName: string;
  printLink: string;
  statusLink: string;
  registrationCode?: string;
  paymentCode?: string | null;
};

export function registrationConfirmationSubject(playerName: string): string {
  return `Registration confirmed — ${playerName} · Future Star U-15`;
}

export function renderRegistrationConfirmationEmail(data: RegistrationConfirmationEmailData): {
  html: string;
  text: string;
} {
  const name = escapeHtml(data.playerName);
  const printLink = data.printLink;
  const statusLink = data.statusLink;

  const codesHtml =
    data.registrationCode || data.paymentCode
      ? emailInfoBox(`
          ${data.registrationCode ? `<p style="margin:0 0 10px;font-size:12px;color:#64748b;text-transform:uppercase;letter-spacing:0.12em;font-weight:700;">Registration code</p>
          <p style="margin:0 0 16px;font-size:22px;font-weight:800;font-family:ui-monospace,Menlo,Consolas,monospace;color:#0c1f3d;letter-spacing:0.06em;">${escapeHtml(data.registrationCode)}</p>` : ""}
          ${data.paymentCode ? `<p style="margin:0 0 10px;font-size:12px;color:#64748b;text-transform:uppercase;letter-spacing:0.12em;font-weight:700;">Payment reference</p>
          <p style="margin:0;font-size:18px;font-weight:800;font-family:ui-monospace,Menlo,Consolas,monospace;color:#0c1f3d;letter-spacing:0.06em;">${escapeHtml(data.paymentCode)}</p>` : ""}
        `)
      : "";

  const bodyHtml = `
    ${emailHeading("You're registered for trials")}
    ${emailParagraph(`Hi <strong style="color:#0c1f3d;">${name}</strong>,`)}
    ${emailParagraph("Thank you for registering with the <strong>Future Star U-15 Championship</strong>. Your trial registration and payment have been recorded successfully.")}
    ${codesHtml}
    ${emailParagraph("Save or print your official acknowledgement using the button below. You can also check your registration status anytime with your email and registration code.")}
    <table role="presentation" class="btn-stack" cellpadding="0" cellspacing="0" border="0" width="100%" style="margin:28px 0 20px;">
      <tr>
        <td align="center" style="padding-bottom:12px;">${emailButton(printLink, "View & print receipt")}</td>
      </tr>
      <tr>
        <td align="center">${emailButton(statusLink, "Check registration status", false)}</td>
      </tr>
    </table>
    ${emailParagraph(`Or copy this link: ${emailTextLink(printLink, "Open receipt")}`)}
  `;

  const html = renderEmailLayout({
    title: "Registration confirmed",
    preheader: `${data.playerName}, your Future Star U-15 trial registration is confirmed.`,
    bodyHtml,
  });

  const text = [
    `Hi ${data.playerName},`,
    "",
    "Your Future Star U-15 trial registration is confirmed.",
    data.registrationCode ? `Registration code: ${data.registrationCode}` : "",
    data.paymentCode ? `Payment reference: ${data.paymentCode}` : "",
    "",
    `Print receipt: ${printLink}`,
    `Check status: ${statusLink}`,
    "",
    "— Future Star U-15 Championship",
  ]
    .filter(Boolean)
    .join("\n");

  return { html, text };
}
