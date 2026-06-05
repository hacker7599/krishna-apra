import { escapeHtml } from "@/lib/email/escape-html";
import {
  emailInfoBox,
  emailParagraph,
  emailTextLink,
  renderEmailLayout,
} from "@/lib/email/templates/layout";
import { emailBodyPlainText, sanitizeEmailBodyHtml } from "@/lib/sanitize-email-body-html";

export type TrialZoneEmailDetails = {
  trialPlace: string;
  zone: string;
  address: string;
  navigationUrl?: string | null;
  contactDetails?: string | null;
};

export type AdminBulkTrialInfoEmailData = {
  playerName: string;
  registrationCode?: string | null;
  subject: string;
  bodyHtml: string;
  trialZone: TrialZoneEmailDetails;
};

function trialZoneBox(zone: TrialZoneEmailDetails): string {
  const rows: string[] = [
    `<p style="margin:0 0 8px;font-size:12px;font-weight:800;letter-spacing:0.08em;text-transform:uppercase;color:#0c1f3d;">Your trial zone</p>`,
    `<p style="margin:0 0 6px;font-size:14px;font-weight:700;color:#0c1f3d;">${escapeHtml(zone.trialPlace)}</p>`,
    `<p style="margin:0 0 10px;font-size:13px;font-weight:600;color:#ea580c;">${escapeHtml(zone.zone)}</p>`,
    `<p style="margin:0 0 8px;font-size:13px;line-height:1.55;color:#334155;white-space:pre-wrap;">${escapeHtml(zone.address)}</p>`,
  ];

  if (zone.contactDetails?.trim()) {
    rows.push(
      `<p style="margin:12px 0 0;font-size:12px;font-weight:700;color:#64748b;">Contact</p>`,
      `<p style="margin:4px 0 0;font-size:13px;line-height:1.55;color:#334155;white-space:pre-wrap;">${escapeHtml(zone.contactDetails.trim())}</p>`,
    );
  }

  if (zone.navigationUrl?.trim()) {
    rows.push(
      `<p style="margin:12px 0 0;font-size:13px;">${emailTextLink(zone.navigationUrl.trim(), "Open venue on Google Maps")}</p>`,
    );
  }

  return emailInfoBox(rows.join(""));
}

const BULK_EMAIL_SIGNATURE_TEAM = "Future Star Champion Team";

function bulkEmailSignature(): string {
  return `<p style="margin:24px 0 0;font-size:15px;line-height:1.6;color:#334155;">Best Regards,<br /><br /><strong style="color:#0c1f3d;">${escapeHtml(BULK_EMAIL_SIGNATURE_TEAM)}</strong></p>`;
}

export function renderAdminBulkTrialInfoEmail(data: AdminBulkTrialInfoEmailData): { html: string; text: string } {
  const bodyHtml = sanitizeEmailBodyHtml(data.bodyHtml);
  const zone = data.trialZone;

  const greetingLine = data.playerName.trim()
    ? emailParagraph(`Dear ${escapeHtml(data.playerName)},`)
    : "";

  const codeLine = data.registrationCode
    ? emailParagraph(`<strong>Registration code:</strong> ${escapeHtml(data.registrationCode)}`)
    : "";

  const bodyParts = [
    greetingLine,
    bodyHtml,
    trialZoneBox(zone),
    codeLine,
    emailParagraph(
      "If you have questions, reply to the league support contacts on our website or reach out to your academy coordinator.",
    ),
    bulkEmailSignature(),
  ].filter(Boolean);

  const html = renderEmailLayout({
    preheader: data.subject,
    title: data.subject,
    bodyHtml: bodyParts.join(""),
    layout: "wide",
  });

  const plainBody = emailBodyPlainText(data.bodyHtml);
  const textBlocks = [
    data.playerName.trim() ? `Dear ${data.playerName},` : "",
    plainBody,
    "",
    "— Your trial zone —",
    zone.trialPlace,
    zone.zone,
    zone.address,
    zone.contactDetails?.trim() ? `Contact: ${zone.contactDetails.trim()}` : "",
    zone.navigationUrl?.trim() ? `Maps: ${zone.navigationUrl.trim()}` : "",
    data.registrationCode ? `Registration code: ${data.registrationCode}` : "",
    "",
    "Best Regards,",
    "",
    BULK_EMAIL_SIGNATURE_TEAM,
  ].filter((line) => line !== "");

  return { html, text: textBlocks.join("\n") };
}
