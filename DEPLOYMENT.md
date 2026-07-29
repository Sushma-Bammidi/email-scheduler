# 🚀 Deployment Guide - Email Scheduler MVP

This guide provides step-by-step instructions for deploying your Email Scheduler monorepo application to production environments.

---

## 📑 Deployment Options Overview

| Platform / Strategy | Best For | Complexity | Cost |
| :--- | :--- | :--- | :--- |
| **Option 1: Docker Compose on VPS** (DigitalOcean / EC2 / Hetzner) | Full control, single server | Low - Medium | ~$5 - $10/mo |
| **Option 2: Cloud Managed** (Render / Railway + Vercel) | Quick setup, auto-scaling | Easy | Free Tier / Pay as you go |

---

## 🐳 Option 1: Single Server VPS Deployment (Docker Compose)

Deploy everything (PostgreSQL, Redis, Express Backend, and React Frontend) onto any Linux VPS using Docker Compose.

---

## ☁️ Option 2: Managed Cloud Services (Render / Railway + Vercel)

### 1. Database & Redis Setup
- **PostgreSQL**: Create a free PostgreSQL instance on [Supabase](https://supabase.com), [Neon](https://neon.tech), or [Render](https://render.com). Save the `DATABASE_URL` connection string.
- **Redis**: Create a Redis database on [Upstash](https://upstash.com) or [Render](https://render.com). Save the `REDIS_HOST`, `REDIS_PORT`, and `REDIS_PASSWORD`.

### 2. Backend Deployment (Render / Railway)
1. Push your repository to GitHub.
2. Connect your repository to **Render** or **Railway**.
3. Set the **Root Directory** to `backend`.
4. Build command: `npm install && npm run build`
5. Start command: `npm start`
6. Configure Environment Variables in the platform dashboard:
   - `DATABASE_URL`
   - `REDIS_HOST`
   - `REDIS_PORT`
   - `REDIS_PASSWORD`
   - `SMTP_HOST` (e.g. `smtp.resend.com` or `smtp.sendgrid.net`)
   - `SMTP_PORT` (`587`)
   - `SMTP_USER`
   - `SMTP_PASS`
   - `SENDER_EMAIL`

### 3. Frontend Deployment (Vercel / Netlify)
1. Create a new project on [Vercel](https://vercel.com) and import your GitHub repository.
2. Set **Root Directory** to `frontend`.
3. Framework Preset: **Vite**.
4. Configure API Proxy or set `VITE_API_BASE_URL` pointing to your deployed backend URL.
5. Click **Deploy**!

---

## ✉️ Production SMTP Configuration

To send real emails to inbox recipients in production instead of Ethereal test emails, configure one of the following transactional email providers in `backend/.env`:

### Resend (Recommended)
```env
SMTP_HOST=smtp.resend.com
SMTP_PORT=587
SMTP_USER=resend
SMTP_PASS=re_123456789_your_api_key
SENDER_EMAIL=newsletter@yourdomain.com
```

### SendGrid
```env
SMTP_HOST=smtp.sendgrid.net
SMTP_PORT=587
SMTP_USER=apikey
SMTP_PASS=SG.your_sendgrid_api_key
SENDER_EMAIL=no-reply@yourdomain.com
```

---

## 🔒 Security & Optimization Checklist

- [ ] Change default PostgreSQL passwords in production `.env`.
- [ ] Enable SSL for PostgreSQL connections (`DATABASE_URL="...sslmode=require"`).
- [ ] Use HTTPS / TLS certificates for your frontend and backend domains.
- [ ] Add CORS restrictions in `backend/src/index.ts` to allow requests only from your frontend domain.
