# Rimoto Community — Backend Architecture & Implementation Guide

**Stack:** Express.js + TypeScript · MySQL · Prisma ORM · JWT Auth · Google OAuth 2.0 · Next.js (App Router)

---

## Table of Contents

1. [Architecture Overview](#1-architecture-overview)
2. [Role Model — Simplified](#2-role-model--simplified)
3. [Authentication Strategy](#3-authentication-strategy)
4. [Database Schema (Prisma)](#4-database-schema-prisma)
5. [Project Structure](#5-project-structure)
6. [Authentication Implementation](#6-authentication-implementation)
7. [API Routes Reference](#7-api-routes-reference)
8. [Middleware Stack](#8-middleware-stack)
9. [Environment Variables](#9-environment-variables)
10. [Next.js Frontend Integration Notes](#10-nextjs-frontend-integration-notes)

---

## 1. Architecture Overview

```
┌─────────────────────────────────────────────────────────┐
│                  CLIENT (Next.js — App Router)            │
│  app/discover/    app/forum/    app/admin/    app/login/  │
└─────────────────────┬───────────────────────────────────┘
                       │ HTTPS + httpOnly Cookie (JWT)
┌─────────────────────▼───────────────────────────────────┐
│              Express + TypeScript API                     │
│                                                           │
│  /api/v1/auth        ← OAuth + credential login          │
│  /api/v1/public      ← Open endpoints for users          │
│  /api/v1/admin       ← Protected, ADMIN role only        │
└─────────────────────┬───────────────────────────────────┘
                       │ Prisma Client
┌─────────────────────▼───────────────────────────────────┐
│                    MySQL Database                          │
└─────────────────────────────────────────────────────────┘
```

---

## 2. Role Model — Simplified

The original spec had four roles (`SUPER_ADMIN`, `MODERATOR`, `ORGANIZER`, `RIDER`). Per your requirement, **collapse this to exactly two roles**:

| Role | Description | Access |
|------|-------------|--------|
| `USER` | Anyone who signs up via Google OAuth or email | Public API only — browse rides, read stories, vote, join rides |
| `ADMIN` | Hardcoded credentials (email + password) seeded at startup | Full control — all public + all admin endpoints |

> **Design Decision:** There is only one `ADMIN` account at any time, created via a DB seed script. Users can never self-promote to ADMIN. The `role` field on the `User` table is the single source of truth — middleware checks it on every protected request.

---

## 3. Authentication Strategy

### 3.1 User Authentication — Google OAuth 2.0

Users log in exclusively via Google OAuth. No password is stored for user accounts.

**Flow:**

```
1. Frontend links to GET /api/v1/auth/google
2. Express redirects to Google consent screen
3. Google redirects back to GET /api/v1/auth/google/callback
4. Server exchanges code for Google profile (email, name, avatar)
5. Server upserts User row (create if first login, else update avatar/name)
6. Server signs a JWT containing { userId, role: "USER" }
7. Server sets JWT as httpOnly cookie (rimoto_token) on the response
8. Express redirects to Next.js /auth/callback which then redirects to /discover
9. All subsequent fetch() calls use credentials: 'include' — cookie sent automatically
```

**Library:** `passport` + `passport-google-oauth20`

**Why OAuth-only for users:**
- No password reset flows to build
- No email verification overhead
- Google handles 2FA/security
- Avatar and display name come for free

---

### 3.2 Admin Authentication — Email + Password (Hardcoded)

Admin is **not** a self-service account. It is seeded once via a Prisma seed script and never exposed in any registration form.

**Flow:**

```
1. Admin navigates to /admin/login (Next.js page, not linked anywhere in the UI)
2. POST /api/v1/auth/admin/login with { email, password }
3. Server loads the single ADMIN user from DB, checks bcrypt hash
4. On success, signs a JWT containing { userId, role: "ADMIN" }
5. Server sets JWT as httpOnly cookie (rimoto_token) — 1 day expiry
6. Next.js middleware intercepts all /admin/* routes, reads cookie, verifies role
7. All /api/v1/admin/* requests automatically include the cookie
```

> **Why not OAuth for Admin?** Hardcoded credentials avoid the risk of an admin's Google account being compromised or deleted taking down the entire admin panel. The admin password lives in your `.env` file and is bcrypt-hashed before seeding.

---

### 3.3 JWT Structure

```json
{
  "sub": "uuid-of-user",
  "role": "USER" | "ADMIN",
  "iat": 1713600000,
  "exp": 1716192000
}
```

- **Expiry:** 7 days for users, 1 day for admin (shorter session, more security)
- **Secret:** `JWT_SECRET` from environment
- **Refresh:** Out of scope for v1 — re-login on expiry

---

## 4. Database Schema (Prisma)

### `prisma/schema.prisma`

```prisma
generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "mysql"
  url      = env("DATABASE_URL")
}

// ─── ENUMS ────────────────────────────────────────────────

enum Role {
  USER
  ADMIN
}

enum SkillLevel {
  BEGINNER
  INTERMEDIATE
  ADVANCED
}

enum RideStatus {
  PENDING
  APPROVED
  REJECTED
  ARCHIVED
}

enum FeaturedSlot {
  HERO_BANNER
  WEEKEND_PICK
  EDITORS_CHOICE
}

enum FlairType {
  RIDE_REVIEW
  ROUTE_GUIDE
  GEAR_TIPS
  SOLO_STORY
  ADVANCED
}

enum StoryStatus {
  PENDING
  APPROVED
  REJECTED
}

enum ActionSeverity {
  SUCCESS
  WARNING
  DANGER
}

// ─── MODELS ───────────────────────────────────────────────

model User {
  id               String    @id @default(uuid())
  email            String    @unique
  firstName        String
  lastName         String
  avatarUrl        String?
  role             Role      @default(USER)

  // OAuth — null for ADMIN, populated for Google users
  googleId         String?   @unique

  // Credential — null for OAuth users, bcrypt hash for ADMIN
  passwordHash     String?

  // Profile extras (user can fill post-signup)
  clubAffiliation  String?
  contactNumber    String?

  joinedAt         DateTime  @default(now())

  // Relations
  rides            Ride[]
  stories          Story[]
  adminLogs        AdminLog[]

  @@map("users")
}

model Ride {
  id                 String        @id @default(uuid())
  title              String
  startLocation      String
  endLocation        String
  dateScheduled      DateTime
  timeStart          String        // e.g. "5:30 AM"
  distanceKm         Decimal       @db.Decimal(8, 2)
  skillLevel         SkillLevel
  bikeRequirement    String        @default("All Bikes")
  whatsappGroupUrl   String
  whatsappJoinsCount Int           @default(0)

  status             RideStatus    @default(PENDING)
  featuredSlot       FeaturedSlot?

  organizerId        String
  organizer          User          @relation(fields: [organizerId], references: [id])

  createdAt          DateTime      @default(now())

  @@map("rides")
}

model Story {
  id              String      @id @default(uuid())
  title           String
  destinationTag  String
  flairType       FlairType
  contentBody     String      @db.LongText
  mediaUrls       Json        // stored as JSON array: ["url1", "url2"]
  mediaMeta       Json        // { photos: 4, videos: 1 }
  images          Json?       // array of image URLs
  ratingScore     Decimal     @db.Decimal(3, 1)
  voteCount       Int         @default(0)
  isPinned        Boolean     @default(false)
  status          StoryStatus @default(PENDING)

  authorId        String
  author          User        @relation(fields: [authorId], references: [id])

  createdAt       DateTime    @default(now())

  @@map("stories")
}

model AdminLog {
  id             String         @id @default(uuid())
  actionSeverity ActionSeverity
  actionType     String         // "Approved", "Rejected", "New story submitted"
  message        String         @db.Text
  createdAt      DateTime       @default(now())

  actorId        String
  actor          User           @relation(fields: [actorId], references: [id])

  @@map("admin_logs")
}
```

### Notes on MySQL-specific choices

- `mediaUrls` and `mediaMeta` use `Json` type — Prisma handles serialization automatically with MySQL 5.7.8+ (JSON column type).
- `contentBody` uses `@db.LongText` to support long-form ride reviews without truncation.
- UUIDs are `String` with `@default(uuid())` — compatible with MySQL without `uuid()` native type issues.

---

## 5. Project Structure

```
rimoto-backend/
├── prisma/
│   ├── schema.prisma
│   └── seed.ts                  ← Seeds the single ADMIN account
│
├── src/
│   ├── index.ts                 ← Express app entry point
│   ├── config/
│   │   └── passport.ts          ← Google OAuth strategy config
│   │
│   ├── middleware/
│   │   ├── authenticate.ts      ← JWT verification, attaches req.user
│   │   └── requireAdmin.ts      ← Role guard: role must be ADMIN
│   │
│   ├── routes/
│   │   ├── auth.routes.ts       ← /api/v1/auth/*
│   │   ├── public.routes.ts     ← /api/v1/public/*
│   │   └── admin.routes.ts      ← /api/v1/admin/*
│   │
│   ├── controllers/
│   │   ├── auth.controller.ts
│   │   ├── rides.controller.ts
│   │   ├── stories.controller.ts
│   │   └── admin.controller.ts
│   │
│   ├── services/
│   │   ├── auth.service.ts      ← JWT sign/verify, bcrypt helpers
│   │   ├── rides.service.ts
│   │   ├── stories.service.ts
│   │   └── adminLog.service.ts  ← Writes to admin_logs table
│   │
│   └── lib/
│       └── prisma.ts            ← Singleton Prisma client
│
├── .env
├── package.json
└── tsconfig.json
```

---

## 6. Authentication Implementation

### 6.1 Prisma Seed — Admin Account

**`prisma/seed.ts`**

```typescript
import { PrismaClient, Role } from '@prisma/client';
import bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  const adminEmail = process.env.ADMIN_EMAIL!;
  const adminPassword = process.env.ADMIN_PASSWORD!;

  if (!adminEmail || !adminPassword) {
    throw new Error('ADMIN_EMAIL and ADMIN_PASSWORD must be set in .env');
  }

  const passwordHash = await bcrypt.hash(adminPassword, 12);

  await prisma.user.upsert({
    where: { email: adminEmail },
    update: { passwordHash },  // allows password rotation via re-seed
    create: {
      email: adminEmail,
      firstName: 'Rimoto',
      lastName: 'Admin',
      role: Role.ADMIN,
      passwordHash,
    },
  });

  console.log(`✓ Admin seeded: ${adminEmail}`);
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
```

Add to `package.json`:
```json
"prisma": {
  "seed": "ts-node prisma/seed.ts"
}
```

Run: `npx prisma db seed`

---

### 6.2 Google OAuth Strategy

**`src/config/passport.ts`**

```typescript
import passport from 'passport';
import { Strategy as GoogleStrategy } from 'passport-google-oauth20';
import prisma from '../lib/prisma';

passport.use(
  new GoogleStrategy(
    {
      clientID: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
      callbackURL: process.env.GOOGLE_CALLBACK_URL!,
    },
    async (_accessToken, _refreshToken, profile, done) => {
      try {
        const email = profile.emails?.[0].value;
        if (!email) return done(new Error('No email from Google'));

        const user = await prisma.user.upsert({
          where: { googleId: profile.id },
          update: {
            firstName: profile.name?.givenName ?? '',
            lastName: profile.name?.familyName ?? '',
            avatarUrl: profile.photos?.[0].value,
          },
          create: {
            googleId: profile.id,
            email,
            firstName: profile.name?.givenName ?? '',
            lastName: profile.name?.familyName ?? '',
            avatarUrl: profile.photos?.[0].value,
            role: 'USER',
          },
        });

        return done(null, user);
      } catch (err) {
        return done(err as Error);
      }
    }
  )
);
```

---

### 6.3 Auth Routes

**`src/routes/auth.routes.ts`**

```typescript
import { Router } from 'express';
import passport from 'passport';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import prisma from '../lib/prisma';

const router = Router();
const JWT_SECRET = process.env.JWT_SECRET!;
const JWT_EXPIRY_USER = '7d';
const JWT_EXPIRY_ADMIN = '1d';

// ── USER: Google OAuth ──────────────────────────────────

router.get('/google',
  passport.authenticate('google', { scope: ['profile', 'email'], session: false })
);

router.get('/google/callback',
  passport.authenticate('google', { session: false, failureRedirect: '/login?error=oauth' }),
  (req, res) => {
    const user = req.user as any;
    const token = jwt.sign(
      { sub: user.id, role: user.role },
      JWT_SECRET,
      { expiresIn: JWT_EXPIRY_USER }
    );
    // Set as httpOnly cookie — Next.js middleware can read this
    res.cookie('rimoto_token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days in ms
    });
    res.redirect(`${process.env.FRONTEND_URL}/discover`);
  }
);

// ── ADMIN: Email + Password ─────────────────────────────

router.post('/admin/login', async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ error: 'Email and password required' });
  }

  const user = await prisma.user.findUnique({ where: { email } });

  if (!user || user.role !== 'ADMIN' || !user.passwordHash) {
    return res.status(401).json({ error: 'Invalid credentials' });
  }

  const valid = await bcrypt.compare(password, user.passwordHash);
  if (!valid) {
    return res.status(401).json({ error: 'Invalid credentials' });
  }

  const token = jwt.sign(
    { sub: user.id, role: user.role },
    JWT_SECRET,
    { expiresIn: JWT_EXPIRY_ADMIN }
  );

  res.cookie('rimoto_token', token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 24 * 60 * 60 * 1000, // 1 day in ms
  });

  res.json({ ok: true });
});

// ── SHARED: Get current user from token ─────────────────

router.get('/me', authenticate, (req, res) => {
  res.json(req.user);
});

export default router;
```

---

### 6.4 Middleware

**`src/middleware/authenticate.ts`**

```typescript
import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import prisma from '../lib/prisma';

declare global {
  namespace Express {
    interface Request {
      user?: { id: string; role: string; email: string };
    }
  }
}

export async function authenticate(req: Request, res: Response, next: NextFunction) {
  // Read from httpOnly cookie (set by Express after OAuth / admin login)
  const token = req.cookies?.rimoto_token;
  if (!token) {
    return res.status(401).json({ error: 'No token provided' });
  }

  try {
    const payload = jwt.verify(token, process.env.JWT_SECRET!) as any;
    const user = await prisma.user.findUnique({ where: { id: payload.sub } });
    if (!user) return res.status(401).json({ error: 'User not found' });
    req.user = { id: user.id, role: user.role, email: user.email };
    next();
  } catch {
    return res.status(401).json({ error: 'Invalid or expired token' });
  }
}
```

**`src/middleware/requireAdmin.ts`**

```typescript
import { Request, Response, NextFunction } from 'express';

export function requireAdmin(req: Request, res: Response, next: NextFunction) {
  if (req.user?.role !== 'ADMIN') {
    return res.status(403).json({ error: 'Admin access required' });
  }
  next();
}
```

Usage in routes: `router.use(authenticate, requireAdmin)`

---

## 7. API Routes Reference

### 7.1 Auth (`/api/v1/auth`)

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| `GET` | `/google` | None | Redirect to Google OAuth |
| `GET` | `/google/callback` | None | OAuth callback, returns JWT |
| `POST` | `/admin/login` | None | Admin credential login |
| `GET` | `/me` | Bearer JWT | Returns current user profile |

---

### 7.2 Public (`/api/v1/public`) — No auth required

| Method | Path | Query Params | Description |
|--------|------|-------------|-------------|
| `GET` | `/rides` | `skill_level`, `timeframe`, `search`, `page`, `limit` | Paginated APPROVED rides. `search` does LIKE against `title`, `startLocation`, `endLocation`, and organizer name |
| `GET` | `/rides/featured` | — | Returns exactly 3 rides with non-null `featuredSlot` |
| `POST` | `/rides/:id/join` | — | Increments `whatsappJoinsCount` by 1, returns `{ whatsappGroupUrl }` for frontend redirect |
| `GET` | `/stories` | `sort` (top/recent), `flair`, `search`, `page`, `limit` | Paginated APPROVED stories. Pinned stories always come first |
| `POST` | `/stories` | — | **Requires Auth.** Create a new story. Body: `{ title, destinationTag, flairType, contentBody, images, ... }` |
| `POST` | `/stories/:id/vote` | — | Body: `{ direction: "up" \| "down" }`. Increments or decrements `voteCount` |

**Ride search implementation detail:**

```typescript
// In rides.service.ts
const where: Prisma.RideWhereInput = {
  status: 'APPROVED',
  ...(skill_level && { skillLevel: skill_level }),
  ...(search && {
    OR: [
      { title: { contains: search } },
      { startLocation: { contains: search } },
      { endLocation: { contains: search } },
      { organizer: { firstName: { contains: search } } },
      { organizer: { lastName: { contains: search } } },
    ],
  }),
};
```

---

### 7.3 Admin (`/api/v1/admin`) — Requires `ADMIN` role

All routes protected by `authenticate + requireAdmin` middleware chain.

| Method | Path | Body / Params | Description |
|--------|------|--------------|-------------|
| `GET` | `/dashboard/metrics` | — | Returns KPI counts + last 10 activity log entries |
| `GET` | `/submissions/rides` | `?status=PENDING\|APPROVED\|REJECTED` | Tabular ride submissions for admin review tabs |
| `POST` | `/submissions/rides/:id/review` | `{ action, featuredSlot? }` | Approve/Reject ride. Auto-writes to `admin_logs` |
| `GET` | `/submissions/stories` | `?status=PENDING\|APPROVED\|REJECTED` | Story submissions for admin review |
| `POST` | `/submissions/stories/:id/review` | `{ action: "APPROVE"\|"REJECT" }` | Approve/Reject story. Auto-writes to `admin_logs` |
| `PUT` | `/content/featured` | `{ slots: [{ rideId, slot }] }` | Update all 3 featured slot assignments atomically |

**Dashboard metrics response shape:**

```typescript
{
  pendingRides: number,
  publishedRides: number,
  totalRiders: number,        // count of users with role USER
  pendingStories: number,
  recentActivity: Array<{
    id: string,
    actionType: string,
    actionSeverity: "SUCCESS" | "WARNING" | "DANGER",
    message: string,
    createdAt: string,        // ISO string, frontend formats as "X hours ago"
    actor: { firstName: string, lastName: string, avatarUrl: string | null }
  }>
}
```

**Featured slots update — atomic transaction:**

```typescript
// admin.controller.ts
const { slots } = req.body;
// slots: [{ rideId: "uuid", slot: "HERO_BANNER" }, ...]
// Exactly 3 slots required

await prisma.$transaction([
  prisma.ride.updateMany({ where: { featuredSlot: { not: null } }, data: { featuredSlot: null } }),
  ...slots.map(({ rideId, slot }) =>
    prisma.ride.update({ where: { id: rideId }, data: { featuredSlot: slot } })
  ),
]);
```

---

## 8. Middleware Stack

```typescript
// src/index.ts
import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import cookieParser from 'cookie-parser';
import passport from 'passport';
import './config/passport'; // register strategy

const app = express();

app.use(helmet());
app.use(cors({
  origin: process.env.FRONTEND_URL,
  credentials: true,  // required for cross-origin cookies
}));
app.use(express.json());
app.use(cookieParser());        // needed to read req.cookies.rimoto_token
app.use(passport.initialize());

// Routes
app.use('/api/v1/auth',   authRoutes);
app.use('/api/v1/public', publicRoutes);
app.use('/api/v1/admin',  authenticate, requireAdmin, adminRoutes);

app.listen(process.env.PORT || 4000);
```

---

## 9. Environment Variables

**`.env`**

```env
# Database
DATABASE_URL="mysql://user:password@localhost:3306/rimoto"

# JWT
JWT_SECRET="your-very-long-random-secret-here"

# Google OAuth
GOOGLE_CLIENT_ID="xxxxx.apps.googleusercontent.com"
GOOGLE_CLIENT_SECRET="GOCSPX-xxxxx"
GOOGLE_CALLBACK_URL="http://localhost:4000/api/v1/auth/google/callback"

# Admin seed credentials (used only during `prisma db seed`)
ADMIN_EMAIL="admin@rimoto.in"
ADMIN_PASSWORD="ChangeMeInProduction!123"

# App
PORT=4000
FRONTEND_URL="http://localhost:3000"   # Next.js dev server
NODE_ENV="development"
```

**Next.js `.env.local`** (frontend — separate repo/folder)

```env
NEXT_PUBLIC_API_URL="http://localhost:4000"
```

> **Security note:** In production, rotate `ADMIN_PASSWORD` and `JWT_SECRET`. Never commit `.env` to git.

---

## 10. Next.js Frontend Integration Notes

### Page Structure — App Router Mapping

| HTML file | Next.js Route | File |
|-----------|--------------|------|
| `rimoto-community-user.html` | `/discover` | `app/discover/page.tsx` |
| `rimoto-reviews-forum.html` | `/forum` | `app/forum/page.tsx` |
| `rimoto-community-admin.html` | `/admin` | `app/admin/page.tsx` |
| *(new)* | `/login` | `app/login/page.tsx` |
| *(new)* | `/admin/login` | `app/admin/login/page.tsx` |

The `/admin/login` route is never linked in any nav or footer — accessed by direct URL only.

---

### Route Protection — Next.js Middleware

Place this file at the **root** of your Next.js project (not inside `app/`). It runs on the Edge before any page renders, reading the httpOnly cookie set by Express.

**`middleware.ts`**

```typescript
import { NextRequest, NextResponse } from 'next/server';
import { jwtVerify } from 'jose';

const JWT_SECRET = new TextEncoder().encode(process.env.JWT_SECRET!);

export async function middleware(req: NextRequest) {
  const token = req.cookies.get('rimoto_token')?.value;

  // Protect all /admin routes except /admin/login
  if (req.nextUrl.pathname.startsWith('/admin') &&
      !req.nextUrl.pathname.startsWith('/admin/login')) {
    if (!token) {
      return NextResponse.redirect(new URL('/admin/login', req.url));
    }
    try {
      const { payload } = await jwtVerify(token, JWT_SECRET);
      if (payload.role !== 'ADMIN') {
        return NextResponse.redirect(new URL('/admin/login', req.url));
      }
    } catch {
      return NextResponse.redirect(new URL('/admin/login', req.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/admin/:path*'],
};
```

> Use `jose` (not `jsonwebtoken`) for JWT verification in Next.js middleware — it runs on the Edge Runtime which does not support Node.js crypto APIs.

---

### Login Pages

**`app/login/page.tsx`** — User login (Google only)

```tsx
export default function LoginPage() {
  return (
    <main>
      <h1>Sign in to Rimoto</h1>
      <a href={`${process.env.NEXT_PUBLIC_API_URL}/api/v1/auth/google`}>
        <button>Continue with Google</button>
      </a>
    </main>
  );
}
```

**`app/admin/login/page.tsx`** — Admin credential login

```tsx
'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function AdminLoginPage() {
  const router = useRouter();
  const [error, setError] = useState('');

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = new FormData(e.currentTarget);
    const res = await fetch(
      `${process.env.NEXT_PUBLIC_API_URL}/api/v1/auth/admin/login`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',   // allows Express to set the cookie
        body: JSON.stringify({
          email: form.get('email'),
          password: form.get('password'),
        }),
      }
    );
    if (res.ok) {
      router.push('/admin');
    } else {
      setError('Invalid credentials');
    }
  }

  return (
    <form onSubmit={handleSubmit}>
      <input name="email" type="email" required />
      <input name="password" type="password" required />
      {error && <p>{error}</p>}
      <button type="submit">Login</button>
    </form>
  );
}
```

---

### API Fetch Utility

All fetch calls must include `credentials: 'include'` so the browser sends the httpOnly cookie cross-origin to your Express server.

```typescript
// lib/api.ts
const BASE = process.env.NEXT_PUBLIC_API_URL;

export async function apiFetch(path: string, init?: RequestInit) {
  const res = await fetch(`${BASE}${path}`, {
    ...init,
    credentials: 'include',   // sends rimoto_token cookie automatically
    headers: {
      'Content-Type': 'application/json',
      ...init?.headers,
    },
  });
  if (!res.ok) throw new Error(`API error ${res.status}`);
  return res.json();
}

// Usage examples
const rides    = await apiFetch('/api/v1/public/rides?skill_level=BEGINNER');
const featured = await apiFetch('/api/v1/public/rides/featured');
const metrics  = await apiFetch('/api/v1/admin/dashboard/metrics');
```

---

### Server Components vs Client Components

| Page | Approach | Reason |
|------|----------|--------|
| `/discover` | Server Component + `fetch` | SEO-friendly ride listing, no interactivity at page level |
| `/forum` | Server Component + Client vote buttons | Initial story list SSR, vote buttons are `'use client'` islands |
| `/admin` | Client Component | Tab switching, modals, and dynamic actions need client state |

---

### Location String Construction

The UI displays `"Chennai → Mahabalipuram"`. Always store as two fields and construct on the client:

```tsx
const routeLabel = `${ride.startLocation} → ${ride.endLocation}`;
```

### Time-Relative Formatting for Admin Logs

```tsx
import { formatDistanceToNow } from 'date-fns';

const timeAgo = formatDistanceToNow(new Date(log.createdAt), { addSuffix: true });
// → "2 hours ago"
```

### Story Vote — Optimistic Update

```tsx
'use client';
const handleVote = async (storyId: string, direction: 'up' | 'down') => {
  setVoteCount(prev => direction === 'up' ? prev + 1 : prev - 1); // optimistic
  try {
    await apiFetch(`/api/v1/public/stories/${storyId}/vote`, {
      method: 'POST',
      body: JSON.stringify({ direction }),
    });
  } catch {
    setVoteCount(prev => direction === 'up' ? prev - 1 : prev + 1); // rollback
  }
};
```

---

## Quick Start Checklist

**Backend (Express)**
- [ ] `npm install` in the backend folder
- [ ] Create MySQL database `rimoto`
- [ ] Set all values in `backend/.env`
- [ ] `npx prisma migrate dev --name init`
- [ ] `npx prisma db seed` — creates admin account
- [ ] Register Google OAuth app at [console.cloud.google.com](https://console.cloud.google.com), set callback URL to `http://localhost:4000/api/v1/auth/google/callback`
- [ ] `npm run dev` — Express runs on port 4000

**Frontend (Next.js)**
- [ ] `npx create-next-app@latest rimoto-web --typescript --app`
- [ ] Set `NEXT_PUBLIC_API_URL=http://localhost:4000` in `rimoto-web/.env.local`
- [ ] Add `JWT_SECRET` (same value as backend) to `rimoto-web/.env.local` for middleware verification
- [ ] Install `jose` and `date-fns`: `npm install jose date-fns`
- [ ] Create `middleware.ts` at project root
- [ ] `npm run dev` — Next.js runs on port 3000

**Verify**
- [ ] `POST http://localhost:4000/api/v1/auth/admin/login` sets `rimoto_token` cookie
- [ ] Navigating to `http://localhost:3000/admin` without login redirects to `/admin/login`
- [ ] Google OAuth flow completes and lands on `/discover`

---

*Documentation covers: Rimoto Community v1 · Express + TypeScript + Prisma + MySQL · Next.js App Router · Two-role auth model (USER via Google OAuth, ADMIN via hardcoded credentials) · httpOnly cookie-based JWT*
