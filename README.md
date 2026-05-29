# Future Star U-15

Next.js site + admin for trial registration, Razorpay/QR payments, and league content.

## Database (MySQL)

Production and local dev use **MySQL** via Prisma (not SQLite). For **XAMPP**, see **[docs/MYSQL-XAMPP.md](docs/MYSQL-XAMPP.md)**:

1. Start MySQL in XAMPP and create database `future_star_u15`
2. Set `DB_HOST`, `DB_PORT`, `DB_USER`, `DB_PASSWORD`, `DB_NAME` in `.env` (see `.env.example`)
3. Run `npm run db:push` and `npm run db:seed`

## Getting Started

```bash
cp .env.example .env
# edit .env (MySQL, Razorpay, SMTP, secrets)
npm ci
npm run db:push
npm run db:seed
```

Run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
