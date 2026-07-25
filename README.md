# HealthMate

An AI-powered multi-role healthcare platform connecting patients, doctors, and hospitals — built for the Nigerian healthcare context.

HealthMate lets patients describe symptoms in natural conversation, receive an AI-assisted preliminary assessment, and book appointments with real, verified doctors — all in one platform.

---

## Features

- **AI symptom assessment** — conversational chat interface powered by Gemini, paired with a custom-trained TensorFlow classification model for disease prediction
- **Multi-role platform** — separate dashboards and permissions for Patients, Doctors, Hospitals, and Admins
- **Doctor & hospital verification** — admin-reviewed approval workflow before doctors/hospitals go live on the platform
- **Appointment booking** — patients can search, filter, and book appointments with approved, independent or hospital-affiliated doctors
- **Real-time chat** — once an appointment is booked, patients and doctors chat live in-app via Socket.io, tied to that specific appointment
- **Health records** — every AI assessment is saved to a patient's history, viewable by the patient and by doctors handling their appointments
- **Secure authentication** — JWT access/refresh token rotation with HttpOnly cookies, plus Google OAuth (one-time code exchange for cross-domain safety)
- **Notifications** — in-app notifications for appointment status changes and account updates

---

## Tech stack

**Frontend**
- Next.js (App Router) + React + TypeScript
- Socket.io-client for real-time chat

**Backend**
- Express + TypeScript (`tsx`)
- PostgreSQL + Prisma ORM
- Socket.io for real-time messaging
- JSON Web Tokens (access + refresh, with rotation)
- Passport.js (Google OAuth)

**AI / ML**
- Google Gemini API — conversational symptom collection and diagnosis explanation
- TensorFlow.js — custom-trained neural network for disease classification from symptom vectors

**Infrastructure**
- Backend deployed on Render
- Frontend deployed on Vercel
- Docker for local development consistency
- Cloudinary for file/image handling

---

## Architecture overview

```
┌─────────────┐        ┌──────────────┐        ┌─────────────┐
│   Next.js    │ ─────▶ │   Express     │ ─────▶ │  PostgreSQL  │
│  Frontend    │ ◀───── │   Backend     │ ◀───── │  (Prisma)    │
└─────────────┘        └──────┬───────┘        └─────────────┘
                              │
                 ┌────────────┼────────────┐
                 ▼            ▼            ▼
            ┌─────────┐ ┌───────────┐ ┌───────────┐
            │ Gemini   │ │ TensorFlow │ │ Socket.io  │
            │ (chat)   │ │ (predict)  │ │ (real-time)│
            └─────────┘ └───────────┘ └───────────┘
```

**Diagnosis flow:** patient describes symptoms in chat → Gemini asks follow-up questions conversationally → once enough information is collected, Gemini returns a structured symptom summary → the TensorFlow model classifies the most likely condition → Gemini generates a friendly explanation → matching approved doctors/hospitals are recommended → the full result is saved to the patient's health record.

---

## Roles

| Role | Capabilities |
|---|---|
| **Patient** | Symptom check, book appointments, view health records, chat with doctors |
| **Doctor** | Independent or hospital-affiliated — manages appointments, views patient profiles & history, chats with patients in real time (pending admin approval) |
| **Hospital** | Optional affiliation for doctors; hospitals themselves are listed as appointment locations (pending admin approval) |
| **Admin** | Approves/rejects doctor & hospital applications, views platform-wide user/appointment stats |

---

## Getting started

### Prerequisites
- Node.js 18.x
- PostgreSQL database
- A Gemini API key

### Backend setup

```bash
cd backend
npm install
```

Create a `.env` file:
```
DATABASE_URL=your_postgres_connection_string
JWT_ACCESS_SECRET=your_secret
JWT_REFRESH_SECRET=your_secret
GEMINI_API_KEY=your_gemini_key
CLIENT_URL=http://localhost:3000
NODE_ENV=development
```

Run database migrations and generate the Prisma client:
```bash
npx prisma migrate dev
npx prisma generate
```

Start the dev server:
```bash
npm run dev
```

### Frontend setup

```bash
cd frontend
npm install
```

Create a `.env.local` file:
```
NEXT_PUBLIC_API_URL=http://localhost:5000
```

Start the dev server:
```bash
npm run dev
```

---

## Project structure

```
backend/
  controllers/     # route handler logic
  routes/            # Express route definitions
  middleware/         # auth & role-based access control
  ml/                   # TensorFlow model training/prediction
  prisma/                # schema + migrations
  services/                # shared business logic (e.g. patient lookups)

frontend/
  app/                # Next.js App Router pages
  components/           # shared UI components
  context/                 # AuthContext (auth state, protected routes)
```

---

## Roadmap

- [ ] Doctor-side patient profile view with full health record history

---

## License

This project is currently unlicensed / private. Contact the maintainer for usage permissions.

---

Built by [Tochukwu Okeakpu](https://github.com/Toch-man)
