import { LEGAL_ENTITY } from "@/lib/site-legal";
import { PLAYER_AGE_CUTOFF_DATE, TRIAL_FEE_INR } from "@/lib/league";

export const LEGAL_LAST_UPDATED = "19 May 2026";

export type LegalSection = {
  id: string;
  title: string;
  paragraphs?: string[];
  list?: string[];
  subsections?: { title: string; paragraphs?: string[]; list?: string[] }[];
};

function cutoffDisplay() {
  const [y, m, d] = PLAYER_AGE_CUTOFF_DATE.split("-").map(Number);
  return new Date(Date.UTC(y, m - 1, d)).toLocaleDateString("en-IN", {
    day: "numeric",
    month: "long",
    year: "numeric",
    timeZone: "UTC",
  });
}

export const PRIVACY_POLICY: {
  summary: string;
  sections: LegalSection[];
} = {
  summary:
    "We collect only what we need to run trials, verify eligibility, and communicate with players and guardians. We do not sell personal data. This policy explains what we collect, why, how long we keep it, and how you can exercise your rights.",
  sections: [
    {
      id: "introduction",
      title: "1. Introduction",
      paragraphs: [
        `This Privacy Policy ("Policy") applies to ${LEGAL_ENTITY.website}, the ${LEGAL_ENTITY.tradeName} (the "League"), and related digital services operated by ${LEGAL_ENTITY.legalName} ("Company", "we", "us", "our").`,
        "By using our website, submitting a trial registration, or interacting with us in connection with the League, you acknowledge that you have read this Policy. If you do not agree, please do not use our services or submit personal data through our forms.",
        "This Policy is published in accordance with applicable Indian law, including the Information Technology Act, 2000 and rules made thereunder, and the Digital Personal Data Protection Act, 2023 (DPDP Act), as and when in force.",
      ],
    },
    {
      id: "controller",
      title: "2. Data fiduciary & contact",
      paragraphs: [
        `For the purposes of this Policy, ${LEGAL_ENTITY.legalName} is the data fiduciary responsible for processing personal data collected through the League's official channels.`,
        `Registered address: ${LEGAL_ENTITY.registeredAddress}`,
        `General enquiries: ${LEGAL_ENTITY.contactEmail}`,
        `Grievance / privacy requests: ${LEGAL_ENTITY.grievanceEmail}`,
      ],
    },
    {
      id: "collection",
      title: "3. Information we collect",
      paragraphs: ["We may collect the following categories of information:"],
      list: [
        "Identity & contact: player name, father/guardian name, academy or club name, postal address, email, and mobile number.",
        "Eligibility: date of birth, playing roles, jersey and shoe sizes for kit allocation.",
        "Achievements & awards: optional information you choose to provide about cricket honours and selections.",
        "Verification documents: government ID (Aadhaar, passport, or birth certificate) and optional payment proof uploaded during registration.",
        "Payment references: transaction or UPI reference numbers where provided (payment card details are not stored on our servers when processed by third-party gateways).",
        "Communications: messages you send to us by email or phone.",
        "Technical data: IP address, browser type, device information, and cookies or similar technologies necessary for security, session management, and site performance.",
      ],
    },
    {
      id: "use",
      title: "4. How we use your information",
      list: [
        "To process and administer trial registrations and verify age eligibility.",
        "To confirm receipt of registration fees and communicate payment status.",
        "To allocate kit sizes, assign trial zones, and share schedule and venue information.",
        "To evaluate player profiles for selection, scouting, and league operations.",
        "To comply with legal obligations, respond to lawful requests, and protect our rights.",
        "To improve our website, prevent fraud, and maintain security.",
        "With your consent or as permitted by law — for league updates, media, and promotional content related to the tournament.",
      ],
    },
    {
      id: "legal-basis",
      title: "5. Legal basis for processing",
      paragraphs: [
        "We process personal data where necessary for the performance of services you request (registration and participation in League activities), where required by law, and where we have a legitimate interest in operating a safe and well-run junior cricket tournament (such as fraud prevention and operational communications).",
        "Where consent is required under applicable law — for example, for certain marketing or media uses — we will seek it separately and you may withdraw consent by contacting us, without affecting processing already lawfully completed.",
      ],
    },
    {
      id: "sharing",
      title: "6. Sharing & disclosure",
      paragraphs: [
        "We do not sell or rent personal data. We may share information only as described below:",
      ],
      list: [
        "Franchise and initiative partners (including Outer Delhi Warriors) involved in organising trials and Season operations.",
        "Title sponsors and commercial partners, only where necessary for sponsorship obligations and with appropriate confidentiality expectations.",
        "Broadcast and streaming partners for match-day production, highlights, and archival use as described in our Terms & Conditions.",
        "Service providers who host our website, store uploads, process payments, or provide email and administrative tools — bound by contract to use data only for our instructions.",
        "Authorities, courts, or regulators when required by applicable law or to protect the safety and integrity of participants.",
      ],
    },
    {
      id: "cookies",
      title: "7. Cookies & similar technologies",
      paragraphs: [
        "Our website may use essential cookies and similar technologies for authentication (including admin access), security, and basic functionality. We do not use cookies for third-party advertising on the public registration site.",
        "You can control cookies through your browser settings; disabling essential cookies may affect how certain features work.",
      ],
    },
    {
      id: "retention",
      title: "8. Data retention",
      paragraphs: [
        "We retain personal data for as long as needed to fulfil the purposes in this Policy, including tournament operations, dispute resolution, and legal compliance.",
        "Registration records, ID proofs, and payment-related documents are typically retained for the Season and a reasonable period thereafter unless a longer period is required by law or legitimate business needs (for example, accounting or claims).",
        "When data is no longer required, we delete or anonymise it using reasonable measures.",
      ],
    },
    {
      id: "security",
      title: "9. Security measures",
      paragraphs: [
        "We implement appropriate technical and organisational safeguards, including access controls for admin systems, secure hosting practices, and restricted access to uploaded documents.",
        "No method of transmission over the internet or electronic storage is completely secure. While we strive to protect your information, we cannot guarantee absolute security.",
      ],
    },
    {
      id: "children",
      title: "10. Minors & parental responsibility",
      paragraphs: [
        `The League is an Under-15 competition. Registrations for players below 18 years of age must be submitted by a parent, guardian, or authorised academy representative.`,
        "By submitting a minor's data, you confirm that you are authorised to provide that information and to accept this Policy on the minor's behalf.",
        "We take additional care with documents relating to minors and limit internal access to what is necessary for registration and tournament operations.",
      ],
    },
    {
      id: "rights",
      title: "11. Your rights",
      paragraphs: ["Subject to applicable law, you may have the right to:"],
      list: [
        "Request access to personal data we hold about you or the player you represent.",
        "Request correction of inaccurate or incomplete data.",
        "Request erasure where processing is no longer necessary or consent is withdrawn, subject to legal exceptions.",
        "Object to or restrict certain processing where provided by law.",
        "Lodge a complaint with the grievance contact below, and where applicable, with the Data Protection Board of India or other competent authority.",
      ],
      subsections: [
        {
          title: "How to exercise your rights",
          paragraphs: [
            `To exercise these rights, email us at ${LEGAL_ENTITY.grievanceEmail} with sufficient detail to verify your identity. We will respond within timelines prescribed by applicable law.`,
          ],
        },
      ],
    },
    {
      id: "grievance",
      title: "12. Grievance redressal",
      paragraphs: [
        `If you have concerns about how we handle personal data, contact our grievance officer at ${LEGAL_ENTITY.grievanceEmail}. Please include your name, contact details, and a description of your concern.`,
        "We will acknowledge and endeavour to resolve grievances promptly and in accordance with applicable requirements.",
      ],
    },
    {
      id: "changes",
      title: "13. Changes to this Policy",
      paragraphs: [
        "We may update this Policy from time to time. The \"Last updated\" date at the top of this page will reflect the latest version. Material changes may be communicated through the website or by email where appropriate.",
        "Continued use of our services after changes constitutes acceptance of the updated Policy, to the extent permitted by law.",
      ],
    },
    {
      id: "contact",
      title: "14. Contact",
      paragraphs: [
        `For privacy-related questions: ${LEGAL_ENTITY.grievanceEmail}`,
        `For general League enquiries: ${LEGAL_ENTITY.contactEmail}`,
      ],
    },
  ],
};

export const TERMS_AND_CONDITIONS: {
  summary: string;
  sections: LegalSection[];
} = {
  summary:
    "These terms govern your use of our website and participation in Future Star U-15 trials and Season activities. Please read them carefully before registering. By submitting a registration, you agree to be bound by these Terms & Conditions.",
  sections: [
    {
      id: "acceptance",
      title: "1. Agreement to terms",
      paragraphs: [
        `These Terms & Conditions ("Terms") constitute a legally binding agreement between you ("Participant", "Guardian", "Academy", or "you") and ${LEGAL_ENTITY.legalName} ("Company", "League", "we", "us") governing access to ${LEGAL_ENTITY.website} and participation in the ${LEGAL_ENTITY.tradeName} ("Tournament").`,
        "By accessing the website, creating a registration, paying fees, or attending trials or matches, you confirm that you have read, understood, and agree to these Terms and our Privacy Policy.",
        "If you register on behalf of a minor, you represent that you are the parent, legal guardian, or duly authorised representative of that minor and accept these Terms on their behalf.",
      ],
    },
    {
      id: "definitions",
      title: "2. Definitions",
      list: [
        `"League" means the ${LEGAL_ENTITY.tradeName} Season 1 and related activities organised by the Company and its partners.`,
        `"Registration" means the official trial registration form submitted online or offline with applicable fees.`,
        `"Selection" means any invitation to trials, camps, franchise allocation, or tournament squad — at the League's sole discretion.`,
        `"Partners" includes title sponsors (e.g. Krishna Apra), franchise initiatives (e.g. Outer Delhi Warriors), broadcast partners, and approved service providers.`,
      ],
    },
    {
      id: "eligibility",
      title: "3. Eligibility & registration",
      paragraphs: [
        `Players must meet the published Under-15 age criteria. For Season 1, players must be born after ${cutoffDisplay()} unless the League publishes a different cut-off in writing.`,
        "All information in the registration form must be accurate and complete. False, misleading, or incomplete information may result in rejection or removal without refund, except where prohibited by law.",
        "The League reserves the right to request additional verification, conduct background checks permitted by law, and refuse or cancel any registration at its discretion.",
        "Registration does not guarantee selection, franchise placement, or participation in the Tournament.",
      ],
    },
    {
      id: "fees",
      title: "4. Fees, payments & refunds",
      paragraphs: [
        `The trial registration fee for Season 1 is ₹${TRIAL_FEE_INR.toLocaleString("en-IN")} (Indian Rupees), inclusive of jersey allocation as stated on the registration form, unless otherwise announced in writing.`,
        "Fees must be paid through approved methods (online payment gateway, UPI, or other methods designated by the League). Manual payment proof may be requested for verification.",
        "Fees are generally non-refundable once processing has begun, except where required by applicable consumer protection law or expressly approved by the League in writing (for example, cancellation of trials due to force majeure).",
        "Transfer of registration from one player to another is not permitted unless expressly authorised by the League.",
        "The League may revise fees for future seasons or categories with prior notice on the official website.",
      ],
    },
    {
      id: "trials",
      title: "5. Trials, selection & schedule",
      list: [
        "Trial dates, venues, and formats are published on the website and may be updated. Participants are responsible for checking official communications.",
        "Attendance at trials is subject to venue rules, capacity, and instructions from officials and coaches.",
        "Selection decisions are final and at the sole discretion of the League and its appointed scouts and coaches.",
        "The League may combine or split trial groups, change formats, or substitute venues for operational or safety reasons.",
      ],
    },
    {
      id: "conduct",
      title: "6. Code of conduct",
      paragraphs: ["All participants, guardians, coaches, and academy representatives must:"],
      list: [
        "Treat players, officials, and staff with respect; harassment, discrimination, or abuse will not be tolerated.",
        "Comply with anti-corruption, fair-play, and anti-doping policies applicable to junior cricket.",
        "Follow venue security, photography, and spectator rules.",
        "Refrain from unauthorised commercial activity or solicitation at League events without written permission.",
      ],
      subsections: [
        {
          title: "Consequences",
          paragraphs: [
            "Breach of conduct may result in immediate removal from trials or the Tournament without refund and may be reported to relevant cricket bodies where appropriate.",
          ],
        },
      ],
    },
    {
      id: "health",
      title: "7. Health, safety & insurance",
      paragraphs: [
        "Participation in cricket involves inherent physical risk. Guardians and academies are responsible for ensuring the player is medically fit to participate.",
        "The League will take reasonable steps to provide a safe environment but does not provide personal medical or accident insurance unless explicitly stated in writing.",
        "Participants must disclose relevant medical conditions where requested and follow medical advice. The League may refuse participation if safety concerns arise.",
        "In case of injury, first-aid and emergency procedures at the venue will apply. Guardians are responsible for subsequent medical care and costs.",
      ],
    },
    {
      id: "media",
      title: "8. Media, image & intellectual property",
      paragraphs: [
        "By registering and participating, you grant the League and its Partners a non-exclusive, royalty-free, worldwide licence to use the participant's name, likeness, voice, performance data, photographs, and video recordings for purposes connected with the Tournament, including promotion, broadcast, streaming, highlights, archives, and sponsor activations, without additional compensation unless otherwise required by law.",
        "The League's logos, branding, website content, and tournament materials are protected by intellectual property laws. You may not copy, modify, or use them without prior written consent.",
        "Participants must not wear conflicting commercial branding at League events except as permitted by kit regulations.",
      ],
    },
    {
      id: "website",
      title: "9. Website use",
      list: [
        "You may use the website only for lawful purposes and in accordance with these Terms.",
        "You must not attempt to gain unauthorised access to admin areas, databases, or other users' data.",
        "You must not introduce malware, scrape the site excessively, or interfere with its operation.",
        "Content on the website is provided for general information; schedules and details may change without notice.",
      ],
    },
    {
      id: "liability",
      title: "10. Limitation of liability",
      paragraphs: [
        `To the maximum extent permitted by applicable law, ${LEGAL_ENTITY.legalName}, its directors, employees, Partners, and affiliates shall not be liable for any indirect, incidental, special, consequential, or punitive damages, or for loss of profits, data, or goodwill, arising from your use of the website or participation in the Tournament.`,
        "Our total liability for any claim arising from these Terms or your registration shall not exceed the registration fee paid by you for the relevant Season, except where liability cannot be limited under applicable law.",
        "Nothing in these Terms excludes liability for death or personal injury caused by negligence, fraud, or any liability that cannot be excluded under Indian law.",
      ],
    },
    {
      id: "indemnity",
      title: "11. Indemnity",
      paragraphs: [
        "You agree to indemnify and hold harmless the League and its Partners from claims, losses, or expenses (including reasonable legal fees) arising from your breach of these Terms, misuse of the website, or wrongful conduct at League events, except to the extent caused by our gross negligence or wilful misconduct.",
      ],
    },
    {
      id: "force-majeure",
      title: "12. Force majeure",
      paragraphs: [
        "We are not liable for failure or delay in performance due to events beyond our reasonable control, including natural disasters, pandemics, government orders, venue unavailability, strikes, or failures of third-party services. In such cases, we may reschedule, modify, or cancel events and will communicate updates through official channels.",
      ],
    },
    {
      id: "law",
      title: "13. Governing law & disputes",
      paragraphs: [
        "These Terms are governed by the laws of India.",
        "Subject to mandatory consumer protection provisions, courts at New Delhi shall have exclusive jurisdiction over disputes arising from or relating to these Terms or the Tournament.",
        "Before initiating formal proceedings, parties agree to attempt good-faith resolution by contacting " + LEGAL_ENTITY.contactEmail + ".",
      ],
    },
    {
      id: "general",
      title: "14. General provisions",
      list: [
        "If any provision of these Terms is held invalid, the remaining provisions remain in effect.",
        "Our failure to enforce a right does not waive that right.",
        "These Terms, together with the Privacy Policy and any written notices on the website, constitute the entire agreement regarding website use and registration for the stated Season.",
        "We may assign our rights and obligations to an affiliate or successor organising entity with notice on the website.",
      ],
    },
    {
      id: "contact",
      title: "15. Contact",
      paragraphs: [
        `${LEGAL_ENTITY.legalName}`,
        LEGAL_ENTITY.registeredAddress,
        `Email: ${LEGAL_ENTITY.contactEmail}`,
        `Grievances: ${LEGAL_ENTITY.grievanceEmail}`,
      ],
    },
  ],
};
