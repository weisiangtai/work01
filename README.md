# Next.js Ecommerce MVP (Manual Workflow)

A complete ecommerce MVP using:
- Next.js App Router
- SQLite + Prisma
- LocalStorage cart
- Admin dashboard with simple password login
- Manual payment verification and manual code delivery (no payment gateway, no auto-delivery)

## Features

### Customer flow
1. Add products to cart
2. Checkout with name and contact
3. System generates order number
4. Order page shows payment instructions
5. User submits payment info (last 5 digits, transfer time, note)

### Admin flow
1. Login with a simple password
2. Review orders and payment submission
3. Update order status
4. Add admin note
5. Manually send code via LINE / Email / Telegram
6. Mark order fulfilled

## Order statuses
- `PENDING_PAYMENT`
- `PENDING_REVIEW`
- `CONFIRMED`
- `FULFILLED`
- `CANCELED`

## Setup

```bash
cp .env.example .env
npm install
npm run prisma:generate
npm run prisma:migrate -- --name init
npm run prisma:seed
npm run dev
```

Open:
- Storefront: `http://localhost:3000`
- Admin login: `http://localhost:3000/admin/login`

## Important constraints implemented
- No payment gateway integration
- No auto verification
- No auto code delivery
- Manual workflow only
