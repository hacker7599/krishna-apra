import { escapeHtml } from "@/lib/email/escape-html";
import { emailButton, emailHeading, emailParagraph, emailTextLink, renderEmailLayout } from "@/lib/email/templates/layout";

export type RegistrationCompletionEmailData = {
  playerName: string;
  completionLink: string;
};

export function registrationCompletionSubject(playerName: string): string {
  return `Complete your registration — ${playerName} · Future Star U-15`;
}

export function renderRegistrationCompletionEmail(data: RegistrationCompletionEmailData): {
  html: string;
  text: string;
} {
  const name = escapeHtml(data.playerName);
  const link = data.completionLink;

  const bodyHtml = `
    ${emailHeading("Complete your registration")}
    ${emailParagraph(`Hi <strong style="color:#0c1f3d;">${name}</strong>,`)}
    ${emailParagraph("We received your trial fee payment. Please complete your player and academy details using the secure link below. This link works once.")}
    <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%" style="margin:28px 0 20px;">
      <tr><td align="center">${emailButton(link, "Complete registration")}</td></tr>
    </table>
    ${emailParagraph(`Or copy this link: ${emailTextLink(link, "Open registration form")}`)}
    ${emailParagraph("If you have already completed the online form, you can ignore this message.")}
  `;

  const html = renderEmailLayout({
    title: "Complete your registration",
    preheader: "Finish your Future Star U-15 trial registration with one click.",
    bodyHtml,
  });

  const text = [
    `Hi ${data.playerName},`,
    "",
    "Please complete your Future Star U-15 registration:",
    link,
    "",
    "— Future Star U-15 Championship",
  ].join("\n");

  return { html, text };
}
