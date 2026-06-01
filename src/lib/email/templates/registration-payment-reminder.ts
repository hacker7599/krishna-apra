import { escapeHtml } from "@/lib/email/escape-html";
import { TRIAL_FEE_INR, LEAGUE_NAME } from "@/lib/league";
import {
  emailButton,
  emailHeading,
  emailInfoBox,
  emailParagraph,
  emailTextLink,
  renderEmailLayout,
} from "@/lib/email/templates/layout";
import { registrationPaymentFallbackUrl } from "@/lib/registration-payment-invite";

export type RegistrationPaymentReminderEmailData = {
  playerName: string;
  paymentLink: string;
  registrationCode?: string | null;
  trialPlace?: string | null;
  trialZone?: string | null;
  expiresDays?: number;
};

export function registrationPaymentReminderSubject(playerName: string): string {
  return `🏏 Secure your trial spot — ${playerName} · ${LEAGUE_NAME}`;
}

export function renderRegistrationPaymentReminderEmail(data: RegistrationPaymentReminderEmailData): {
  html: string;
  text: string;
} {
  const name = escapeHtml(data.playerName);
  const link = data.paymentLink;
  const fallback = registrationPaymentFallbackUrl();
  const fee = TRIAL_FEE_INR.toLocaleString("en-IN");
  const expiresDays = data.expiresDays ?? 7;

  const venueLine =
    data.trialPlace && data.trialZone
      ? `${escapeHtml(data.trialPlace)} · ${escapeHtml(data.trialZone)}`
      : data.trialPlace
        ? escapeHtml(data.trialPlace)
        : "Your selected trial zone";

  const heroBanner = `
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="margin:0 0 24px;border-radius:10px;overflow:hidden;background:linear-gradient(135deg,#0c1f3d 0%,#1e3a5f 50%,#0c1f3d 100%);">
      <tr>
        <td style="padding:28px 24px;text-align:center;">
          <p style="margin:0 0 8px;font-size:11px;font-weight:800;letter-spacing:0.2em;text-transform:uppercase;color:#fdba74;">One step left</p>
          <p style="margin:0;font-size:28px;font-weight:900;font-style:italic;letter-spacing:-0.02em;text-transform:uppercase;color:#ffffff;line-height:1.1;">You're almost in!</p>
        </td>
      </tr>
    </table>
  `;

  const codeHtml = data.registrationCode
    ? `<p style="margin:12px 0 0;font-size:11px;color:#64748b;text-transform:uppercase;letter-spacing:0.1em;font-weight:700;">Registration code</p>
       <p style="margin:4px 0 0;font-size:20px;font-weight:800;font-family:ui-monospace,Menlo,Consolas,monospace;color:#0c1f3d;">${escapeHtml(data.registrationCode)}</p>`
    : "";

  const summaryBox = emailInfoBox(`
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0">
      <tr>
        <td style="vertical-align:top;">
          <p style="margin:0 0 6px;font-size:11px;font-weight:700;letter-spacing:0.14em;text-transform:uppercase;color:#ea580c;">Your trial</p>
          <p style="margin:0;font-size:17px;font-weight:800;color:#0c1f3d;line-height:1.3;">${venueLine}</p>
          ${codeHtml}
        </td>
        <td align="right" style="vertical-align:top;white-space:nowrap;padding-left:16px;">
          <p style="margin:0 0 4px;font-size:11px;font-weight:700;letter-spacing:0.1em;text-transform:uppercase;color:#64748b;">Trial fee</p>
          <p style="margin:0;font-size:26px;font-weight:900;color:#ea580c;">₹${fee}</p>
        </td>
      </tr>
    </table>
  `);

  const stepsHtml = `
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="margin:20px 0 8px;">
      <tr>
        <td style="padding:12px 0;border-bottom:1px solid #e2e8f0;">
          <span style="display:inline-block;width:28px;height:28px;line-height:28px;text-align:center;border-radius:50%;background:#ea580c;color:#fff;font-size:13px;font-weight:800;margin-right:12px;">1</span>
          <span style="font-size:14px;font-weight:600;color:#334155;">Tap the button below — your details are already saved</span>
        </td>
      </tr>
      <tr>
        <td style="padding:12px 0;border-bottom:1px solid #e2e8f0;">
          <span style="display:inline-block;width:28px;height:28px;line-height:28px;text-align:center;border-radius:50%;background:#ea580c;color:#fff;font-size:13px;font-weight:800;margin-right:12px;">2</span>
          <span style="font-size:14px;font-weight:600;color:#334155;">Complete secure Razorpay payment in under 2 minutes</span>
        </td>
      </tr>
      <tr>
        <td style="padding:12px 0;">
          <span style="display:inline-block;width:28px;height:28px;line-height:28px;text-align:center;border-radius:50%;background:#ea580c;color:#fff;font-size:13px;font-weight:800;margin-right:12px;">3</span>
          <span style="font-size:14px;font-weight:600;color:#334155;">Receive confirmation &amp; your official receipt instantly</span>
        </td>
      </tr>
    </table>
  `;

  const bodyHtml = `
    ${heroBanner}
    ${emailParagraph(`Hi <strong style="color:#0c1f3d;">${name}</strong>,`)}
    ${emailParagraph(
      `Your <strong>Future Star U-15</strong> trial registration is saved — we just need your payment to lock your spot. Spots are limited across Delhi NCR zones, so complete payment soon.`,
    )}
    ${summaryBox}
    ${stepsHtml}
    <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%" style="margin:28px 0 8px;">
      <tr>
        <td align="center">${emailButton(link, "Pay & secure my spot")}</td>
      </tr>
    </table>
    ${emailParagraph(
      `<span style="font-size:13px;color:#64748b;">Link valid for <strong>${expiresDays} days</strong>. Lost this email? Open ${emailTextLink(fallback, "pay with your mobile number")} on any device.</span>`,
    )}
    ${emailParagraph(`<span style="font-size:12px;color:#94a3b8;">Or copy your personal link: ${emailTextLink(link, "Open payment page")}</span>`)}
  `;

  const html = renderEmailLayout({
    title: "Complete your trial payment",
    preheader: `${data.playerName}, one tap to secure your Future Star U-15 trial spot — ₹${fee}.`,
    bodyHtml,
  });

  const text = [
    `Hi ${data.playerName},`,
    "",
    "You're one step away from securing your Future Star U-15 trial spot!",
    data.trialPlace ? `Trial: ${data.trialPlace}${data.trialZone ? ` · ${data.trialZone}` : ""}` : "",
    data.registrationCode ? `Code: ${data.registrationCode}` : "",
    `Fee: ₹${fee}`,
    "",
    `Pay now: ${link}`,
    "",
    `Link expires in ${expiresDays} days.`,
    `No link? Visit ${fallback} and enter your registered mobile number.`,
    "",
    "— Future Star U-15 Championship",
  ]
    .filter(Boolean)
    .join("\n");

  return { html, text };
}
