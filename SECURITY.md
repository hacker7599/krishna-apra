# Security checklist — Future Star U-15

## Production environment (required)

| Variable | Purpose |
|----------|---------|
| `ADMIN_JWT_SECRET` | 32+ random chars; admin session signing |
| `REGISTRATION_TOKEN_SECRET` | 32+ random chars; **required in production** (receipt JWT + OTP; separate from admin) |
| `RAZORPAY_KEY_SECRET` | Server only — never `NEXT_PUBLIC_` |
| `RAZORPAY_WEBHOOK_SECRET` | Razorpay dashboard → webhook signing |
| `ADMIN_SETUP_DISABLED=true` | After first `/admin/setup` |
| `TRUST_PROXY_HEADERS=true` | Behind Vercel/nginx for accurate rate limits |

```bash
npx prisma db push   # applies RateLimitEvent, unique email + phone on Registration
```

## Payments (Razorpay)

- Trial fee amount is fixed server-side; signature verified with `timingSafeEqual`.
- Payment order is bound to registrant email, phone, and name at order creation.
- `razorpayOrderId` is unique per registration — one payment cannot complete two sign-ups.
- Webhook requires valid HMAC and exact `payment.amount` before marking paid.

## Registrations & receipts

- Email and normalized phone are **unique** in the database (race-safe with transaction re-check).
- Receipt access: HttpOnly cookie after register/OTP verify; email links still use `?token=` (7-day JWT).
- Status OTP responses do not reveal whether an email is registered.
- Rate limits stored in DB (`RateLimitEvent`) — shared across app instances using the same database.

## Uploads

- UUID filenames; MIME allowlist plus magic-byte verification (JPEG/PNG/WebP/PDF).

## Admin

- HttpOnly cookie, `SameSite=strict`, CSRF on mutating APIs.
- Blog HTML sanitized on save and on public render.
