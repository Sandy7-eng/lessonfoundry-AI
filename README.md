# LessonFoundry — AI-Powered Lesson & Assessment Engine

LessonFoundry is a modern web platform built with Next.js, TypeScript, PostgreSQL, Prisma, and Zod.

---

## 🛠️ Stack & Architecture

- **Frontend**: Next.js 16 (App Router), React 19, Vanilla CSS with custom tokens & ambient background system
- **Backend & Database**: Prisma ORM 6, PostgreSQL (Supabase compatible)
- **Validation**: Zod 4

---

## 🚀 Environment Variables

Copy `.env.example` to `.env`:

```bash
cp .env.example .env
```

| Variable | Description | Default / Example |
|---|---|---|
| `DATABASE_URL` | PostgreSQL connection string | `postgresql://postgres:postgres@localhost:5432/lessonfoundry?schema=public` |
| `NODE_ENV` | Application environment | `development` |

> Note: The frontend is designed to run and compile without requiring live database credentials.

---

## 🗄️ Database & Prisma Setup

### 1. Validate Schema

```bash
npx prisma validate
```

### 2. Generate Prisma Client

```bash
npx prisma generate
```

### 3. Run Migrations / Push Schema

```bash
# Push schema changes to a local/remote PostgreSQL instance
npx prisma db push

# Create a migration (for production)
npx prisma migrate dev --name init
```

### 4. Seed Development Data

```bash
npm run db:seed
# or
npx prisma db seed
```

The seed script creates:
- 1 User (Teacher)
- 1 Unit (Photosynthesis & Cellular Respiration)
- 1 Source PDF document metadata
- 2 Learning Objectives (LO1, LO2)
- Unit Constraints
- 2 Sample Assets (Concept Guide, Formative Quiz with 2 Questions)
- Objective Alignments
- Review feedback
- Open Quality Issue
- Unit Version, Asset Version, and Provenance audit log

---

## 💻 Local Development Commands

```bash
# Start development server
npm run dev

# Run ESLint check
npm run lint

# Run Production Build check
npm run build
```

---

## 📁 Project Structure

```text
prisma/
  ├── schema.prisma           # Normalized Prisma Schema
  └── seed.ts                 # Development Seed Data Script
src/
  ├── app/                    # Next.js App Router Pages & Components
  ├── components/             # Reusable UI Components
  ├── lib/
  │   ├── db/
  │   │   └── prisma.ts       # Graceful Prisma DB Client Singleton
  │   ├── mockData.ts         # Frontend mock data
  │   └── utils.ts            # UI utilities & styling helpers
  └── server/
      ├── schemas/            # Zod Validation Schemas
      └── services/           # Backend Domain Services
          ├── assets/
          ├── objectives/
          ├── quality/
          ├── reviews/
          ├── sources/
          ├── units/
          └── versions/
```
