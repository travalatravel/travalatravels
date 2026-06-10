# Travala.com Clone

Full-featured recreation of [Travala.com](https://www.travala.com/) with real search, booking, registration, and login.

## Features

- **Search** – Hotels, Flights, Car Rentals, Activities (**17,348 offers** from real Travala scrape)
- **Book** – Real booking flow with date/guest selection and payment method
- **Auth** – Register, login, session management (JWT cookies)
- **My Trips** – View all confirmed bookings
- **UI** – Travala brand design, responsive layout

## Quick Start

```bash
cd travala-clone
npm install
npm run db:setup    # First time only: migrate + seed
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

### Accounts

| Role | Email | Password |
|------|-------|----------|
| User | `demo@travala.com` | `demo1234` |
| Admin | `admin@travala.com` | `admin1234` |

### Admin Dashboard

Login as admin → click **Admin** in header or go to `/admin`

- **Dashboard** – Stats, revenue, recent bookings
- **Users** – All registered users
- **Bookings** – All bookings with payment status (Mark as Paid / Failed)
- **Crypto Wallets** – Add/edit wallet addresses, see last modified date & by whom

### Crypto Payment Flow

1. User books with BTC/ETH/USDC
2. Wallet address shown → user sends crypto
3. User submits transaction hash
4. Status: `Awaiting Confirmation`
5. Admin confirms in dashboard → `Paid` → booking confirmed

## User Flow

1. **Search** – Use hero search or navigate to Stays/Flights/Car Rental/Activities
2. **Browse** – Click any result to view details
3. **Book** – Log in (or register), select dates/guests, choose payment, click "Book Now"
4. **My Trips** – View all bookings at `/my-trips`

## API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/auth/register` | Create account |
| POST | `/api/auth/login` | Log in |
| POST | `/api/auth/logout` | Log out |
| GET | `/api/auth/me` | Current user |
| GET | `/api/search?type=&q=` | Search offers |
| GET | `/api/offers/[id]` | Offer details |
| POST | `/api/bookings` | Create booking (auth required) |
| GET | `/api/bookings` | List user bookings (auth required) |

## Database

SQLite via Prisma. Offer data lives in `data/travala-offers.json` (included in repo):

| Type | Count |
|------|------:|
| Hotels | 14,008 |
| Flights | 2,951 |
| Car Rentals | 193 |
| Activities | 196 |
| **Total** | **17,348** |

```bash
npm run db:seed        # Import all offers into SQLite (~2–5 min)
npm run import:offers  # Re-scrape from travala.com (optional)
```

> **Railway:** After first deploy run `npx prisma db seed` in the Railway shell so the live database gets all offers (migrations alone do not import them).

## Tech Stack

- Next.js 16, React 19, TypeScript
- Prisma 5 + SQLite
- JWT sessions (jose + bcryptjs)
- Tailwind CSS v4
