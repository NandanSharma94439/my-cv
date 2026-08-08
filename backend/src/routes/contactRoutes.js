/**
 * contactRoutes.js
 * ----------------
 * Defines all routes mounted under /api/contact.
 * Also defines the health check endpoint.
 */

import { Router }        from 'express';
import { submitContact } from '../controllers/contactController.js';
import { contactLimiter } from '../middleware/rateLimiter.js';
import { sanitizeBody }  from '../middleware/sanitize.js';

const router = Router();

// ─────────────────────────────────────────────────────────────
// GET /
// Root welcome route for browser test
// ─────────────────────────────────────────────────────────────
router.get('/', (_req, res) => {
  res.status(200).json({
    name: 'Portfolio Contact API',
    status: 'online',
    health: '/health',
    endpoints: {
      submitContact: 'POST /api/contact'
    }
  });
});

// ─────────────────────────────────────────────────────────────
// GET /health
// Simple liveness probe — useful for uptime monitors, Vercel,
// and your own sanity during debugging.
// ─────────────────────────────────────────────────────────────
router.get('/health', (_req, res) => {
  res.status(200).json({
    status:    'ok',
    timestamp: new Date().toISOString(),
    uptime:    `${Math.floor(process.uptime())}s`,
  });
});

// ─────────────────────────────────────────────────────────────
// POST /api/contact
//
// Middleware chain (in order):
//   1. contactLimiter  — 5 req / 15 min per IP
//   2. sanitizeBody    — strip HTML/null bytes from all string fields
//   3. submitContact   — validate → persist → respond
// ─────────────────────────────────────────────────────────────
router.post('/api/contact', contactLimiter, sanitizeBody, submitContact);

export default router;
