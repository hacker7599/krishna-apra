import { cricketMatchWide } from "@/lib/remote-images";

/** Shared copy for seed data and the admin “fill sample” helper. */
export const SAMPLE_BLOG_SLUG = "season-1-trials-now-open";

export const sampleBlogPost = {
  slug: SAMPLE_BLOG_SLUG,
  title: "Season 1 trials are open — register for Future Star U-15",
  excerpt:
    "Under-15 players across Delhi NCR can book trial slots, meet franchise scouts, and begin their Future Star journey with Krishna Apra as title sponsor.",
  authorName: "Future Star League Desk",
  coverImageUrl: cricketMatchWide(1200),
  metaTitle: "Season 1 trials open · Future Star U-15 Delhi NCR",
  metaDescription:
    "Official trial registration for Future Star U-15 — franchise T20 pathway, live broadcast, and Delhi NCR venues. Book your slot today.",
  metaKeywords: "Future Star U-15, cricket trials, Delhi NCR, Under-15, Krishna Apra, registration",
  content: `<h2>Trials are live for Season 1</h2>
<p>Future Star U-15 is inviting <strong>Under-15 cricketers</strong> from Delhi NCR to register for official trial assessments. This is your pathway into franchise-style T20 cricket with match-day production, coaching standards, and visibility through our broadcast partners.</p>
<h3>What to expect on trial day</h3>
<ul>
<li>Check-in with your <strong>trial fee receipt</strong> (online or offline registration)</li>
<li>Fitness and skills assessment with zone coordinators</li>
<li>Opportunity to be shortlisted for <strong>franchise squad pools</strong></li>
</ul>
<h3>Who can register?</h3>
<p>Players must meet the published <strong>age cut-off</strong> on the registration form (born after 1 August 2010). Bring valid age proof — Aadhaar, passport, or birth certificate.</p>
<h3>How to sign up</h3>
<ol>
<li>Visit the <a href="/register">registration page</a> and complete the form</li>
<li>Pay the trial fee securely online, or use the offline form if instructed by your academy</li>
<li>Save your confirmation email — you can also <a href="/register/status">check registration status</a> anytime</li>
</ol>
<blockquote><p><strong>Tip for parents:</strong> Double-check the player’s date of birth and mobile number before payment. Our team uses these details for zone allocation and receipts.</p></blockquote>
<h3>Stay connected</h3>
<p>Follow announcements here on our blog for venue updates, franchise news, and broadcast schedules. For partnerships, visit <a href="/sponsorship">Sponsorship</a>.</p>
<p><strong>Ready to play?</strong> <a href="/register">Register for trials</a> today.</p>`,
} as const;
