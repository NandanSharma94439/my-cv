# Portfolio Contact Form — Backend

Production-ready Node.js + Express.js backend for Nandan Sharma's portfolio contact form.  
Stores submissions in Supabase PostgreSQL with full security hardening.

---

## Folder Structure

```
backend/
├── src/
│   ├── config/
│   │   └── supabase.js          <- Supabase client singleton
│   ├── controllers/
│   │   └── contactController.js <- HTTP handler (thin layer)
│   ├── middleware/
│   │   ├── rateLimiter.js       <- Global + per-route rate limiting
│   │   ├── sanitize.js          <- XSS / HTML injection protection
│   │   └── requestLogger.js     <- Morgan HTTP logger
│   ├── routes/
│   │   └── contactRoutes.js     <- Route definitions
│   ├── services/
│   │   └── contactService.js    <- All Supabase DB interactions
│   ├── utils/
│   │   └── validators.js        <- Pure input validation
│   ├── app.js                   <- Express app factory
│   └── server.js                <- HTTP server + graceful shutdown
├── supabase/
│   └── migrations/
│       └── 001_create_contact_messages.sql
├── .env.example
├── .gitignore
├── package.json
└── README.md (this file)
```

---

## Step 1 - Create a Supabase Project

1. Go to https://supabase.com and sign in (free tier available).
2. Click "New project".
3. Choose a name (e.g. nandan-portfolio) and a strong DB password.
4. Select region closest to India: Southeast Asia - Singapore.
5. Wait ~2 minutes for provisioning.

Once ready, go to Project Settings > API and copy:
- Project URL  ->  SUPABASE_URL
- service_role key (reveal it) ->  SUPABASE_SERVICE_ROLE_KEY

WARNING: Never share or commit the service_role key. It bypasses all RLS.

---

## Step 2 - Run the Database Migration

1. In your Supabase dashboard, click SQL Editor in the left sidebar.
2. Click "New query".
3. Paste the entire contents of supabase/migrations/001_create_contact_messages.sql
4. Click Run (or Ctrl+Enter).
5. You should see: "Success. No rows returned."

Verify in Table Editor - you should see contact_messages listed.

---

## Step 3 - Environment Setup

  cd backend
  cp .env.example .env

Open .env and fill in:

  SUPABASE_URL=https://your-project-id.supabase.co
  SUPABASE_SERVICE_ROLE_KEY=your-service-role-key-here
  PORT=3000
  ALLOWED_ORIGIN=http://localhost:5500
  NODE_ENV=development

---

## Step 4 - Installation

  cd backend
  npm install

---

## Step 5 - Local Development

  npm run dev

Expected output:
  Server running on http://localhost:3000
  Health check: http://localhost:3000/health
  Contact API:  http://localhost:3000/api/contact

---

## Step 6 - Test the API

Health check:
  curl http://localhost:3000/health

Valid contact submission:
  curl -X POST http://localhost:3000/api/contact \
    -H "Content-Type: application/json" \
    -d "{\"name\":\"Test User\",\"email\":\"test@example.com\",\"subject\":\"Hello\",\"message\":\"This is a test message from the portfolio form.\"}"

Expected:
  { "success": true, "message": "Message sent successfully...", "id": "uuid" }

Check Supabase Table Editor > contact_messages to see the new row.

Missing field test:
  curl -X POST http://localhost:3000/api/contact \
    -H "Content-Type: application/json" \
    -d "{\"name\":\"Test\",\"email\":\"bad-email\"}"

Expected:
  { "success": false, "message": "Subject is required.", "errors": [...] }

---

## API Reference

GET /health
  Returns server status, timestamp, uptime.

POST /api/contact
  Body: { name, email, subject, message }
  201: { success: true, message: "...", id: "uuid" }
  400: { success: false, message: "validation error", errors: [...] }
  429: { success: false, message: "rate limited or duplicate" }
  503: { success: false, message: "DB unavailable" }

---

## Security

  XSS           - sanitize-html strips all HTML before validation
  SQL Injection  - Supabase SDK uses parameterized queries
  Spam           - 5 req/15 min rate limit on contact route
  Duplicates     - Same email+subject rejected within 10 minutes
  Headers        - Helmet sets 15 security response headers
  CORS           - Allowlist via ALLOWED_ORIGIN env variable
  Secrets        - .env in .gitignore, service role key is server-only
  Payloads       - Body limited to 10kb

---

## Deployment to Vercel

1. Push the backend/ folder to a separate GitHub repository.
2. Go to vercel.com > New Project > Import.
3. Set Root Directory to backend/.
4. Add all env variables in Vercel dashboard (NODE_ENV=production).
5. Set ALLOWED_ORIGIN to your frontend URL (e.g. https://nandan-portfolio.vercel.app).
6. Deploy and copy the backend URL.
7. Update API_BASE_URL in script.js to your deployed backend URL.
