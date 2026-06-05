import { escapeHtml } from "@/lib/email/escape-html";
import { LEAGUE_NAME, LEAGUE_SUBTITLE, REGION, TITLE_SPONSOR } from "@/lib/league";
import { getAppBaseUrl } from "@/lib/app-url";

const BRAND_NAVY = "#0c1f3d";
const BRAND_ORANGE = "#ea580c";
const BRAND_ORANGE_DARK = "#c2410c";

export type EmailLayoutOptions = {
  preheader?: string;
  title: string;
  bodyHtml: string;
  /** default = 600px card on gray; wide = full-width white (bulk / long-form) */
  layout?: "default" | "wide";
};

export function renderEmailLayout({ preheader, title, bodyHtml, layout = "default" }: EmailLayoutOptions): string {
  const siteUrl = escapeHtml(getAppBaseUrl());
  const preheaderText = escapeHtml(preheader ?? title);
  const isWide = layout === "wide";

  const bodyBg = isWide ? "#ffffff" : "#e2e8f0";
  const outerPad = isWide ? "0" : "32px 16px";
  const containerWidth = isWide ? "100%" : "600";
  const containerStyle = isWide
    ? "max-width:100%;width:100%;background-color:#ffffff;"
    : "max-width:600px;width:100%;background-color:#ffffff;border-radius:12px;overflow:hidden;box-shadow:0 8px 32px rgba(12,31,61,0.12);";
  const headerPad = isWide ? "padding:24px 28px 20px;" : "padding:28px 40px 24px;";
  const bodyPad = isWide ? "padding:20px 28px 24px;" : "padding:36px 40px 32px;";
  const footerPad = isWide ? "padding:20px 28px 28px;" : "padding:24px 40px 32px;";

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <meta http-equiv="X-UA-Compatible" content="IE=edge" />
  <title>${escapeHtml(title)}</title>
  <!--[if mso]><noscript><xml><o:OfficeDocumentSettings><o:PixelsPerInch>96</o:PixelsPerInch></o:OfficeDocumentSettings></xml></noscript><![endif]-->
  <style>
    @media only screen and (max-width: 620px) {
      .email-container { width: 100% !important; }
      .email-pad { padding-left: 16px !important; padding-right: 16px !important; }
      .btn-stack td { display: block !important; width: 100% !important; padding-bottom: 10px !important; }
    }
  </style>
</head>
<body style="margin:0;padding:0;background-color:${bodyBg};font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,'Helvetica Neue',Arial,sans-serif;">
  <div style="display:none;max-height:0;overflow:hidden;mso-hide:all;">${preheaderText}</div>
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="background-color:${bodyBg};">
    <tr>
      <td align="center" style="padding:${outerPad};">
        <table role="presentation" class="email-container" width="${containerWidth}" cellpadding="0" cellspacing="0" border="0" style="${containerStyle}">
          <!-- Header -->
          <tr>
            <td style="background:linear-gradient(135deg, ${BRAND_NAVY} 0%, #1a3358 100%);padding:0;">
              <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0">
                <tr>
                  <td class="email-pad" style="${headerPad}">
                    <p style="margin:0 0 6px;font-size:10px;font-weight:700;letter-spacing:0.22em;text-transform:uppercase;color:#fdba74;">${escapeHtml(REGION)} · Season 1</p>
                    <h1 style="margin:0;font-size:26px;font-weight:800;font-style:italic;letter-spacing:-0.02em;text-transform:uppercase;color:#ffffff;line-height:1.1;">${escapeHtml(LEAGUE_NAME)}</h1>
                    <p style="margin:6px 0 0;font-size:13px;font-weight:600;letter-spacing:0.12em;text-transform:uppercase;color:rgba(255,255,255,0.75);">${escapeHtml(LEAGUE_SUBTITLE)}</p>
                  </td>
                </tr>
                <tr>
                  <td style="height:3px;background:linear-gradient(90deg,#ff9933 33.33%,#ffffff 33.33% 66.66%,#138808 66.66%);font-size:0;line-height:0;">&nbsp;</td>
                </tr>
              </table>
            </td>
          </tr>
          <!-- Body -->
          <tr>
            <td class="email-pad" style="${bodyPad}">
              ${bodyHtml}
            </td>
          </tr>
          <!-- Footer -->
          <tr>
            <td class="email-pad" style="${footerPad}background-color:#f8fafc;border-top:1px solid #e2e8f0;">
              <p style="margin:0 0 8px;font-size:12px;font-weight:600;color:#64748b;line-height:1.5;">
                ${escapeHtml(TITLE_SPONSOR)} presents ${escapeHtml(LEAGUE_NAME)} ${escapeHtml(LEAGUE_SUBTITLE)} · ${escapeHtml(REGION)}
              </p>
              <p style="margin:0;font-size:11px;color:#94a3b8;line-height:1.5;">
                <a href="${siteUrl}" style="color:${BRAND_ORANGE};text-decoration:none;font-weight:600;">${siteUrl}</a>
              </p>
              <p style="margin:12px 0 0;font-size:10px;color:#94a3b8;line-height:1.4;">
                This is an automated message. Please do not reply directly to this email.
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;
}

export function emailButton(href: string, label: string, primary = true): string {
  const safeHref = escapeHtml(href);
  const safeLabel = escapeHtml(label);
  const bg = primary ? `linear-gradient(180deg,#fb923c 0%,${BRAND_ORANGE} 55%,${BRAND_ORANGE_DARK} 100%)` : "#ffffff";
  const color = primary ? "#ffffff" : BRAND_NAVY;
  const border = primary ? "none" : `2px solid ${BRAND_NAVY}`;

  return `<table role="presentation" cellpadding="0" cellspacing="0" border="0" style="margin:0 auto;">
    <tr>
      <td align="center" style="border-radius:6px;background:${bg};border:${border};">
        <a href="${safeHref}" target="_blank" rel="noopener noreferrer" style="display:inline-block;padding:14px 28px;font-size:13px;font-weight:800;letter-spacing:0.1em;text-transform:uppercase;text-decoration:none;color:${color};">${safeLabel}</a>
      </td>
    </tr>
  </table>`;
}

export function emailTextLink(href: string, label: string): string {
  return `<a href="${escapeHtml(href)}" target="_blank" rel="noopener noreferrer" style="color:${BRAND_ORANGE};font-weight:700;text-decoration:underline;">${escapeHtml(label)}</a>`;
}

export function emailInfoBox(html: string): string {
  return `<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="margin:20px 0;background-color:#f8fafc;border:1px solid #e2e8f0;border-left:4px solid ${BRAND_ORANGE};border-radius:8px;">
    <tr><td style="padding:16px 18px;">${html}</td></tr>
  </table>`;
}

export function emailParagraph(text: string): string {
  return `<p style="margin:0 0 16px;font-size:15px;line-height:1.65;color:#334155;">${text}</p>`;
}

export function emailHeading(text: string): string {
  return `<h2 style="margin:0 0 20px;font-size:22px;font-weight:800;color:${BRAND_NAVY};line-height:1.25;">${escapeHtml(text)}</h2>`;
}
