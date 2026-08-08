/**
 * contactController.js
 * --------------------
 * HTTP request handler for POST /api/contact.
 *
 * Responsibilities (only):
 *   1. Extract input from req.body (already sanitized by middleware)
 *   2. Call the validator
 *   3. Call the service
 *   4. Return a consistent JSON response
 *
 * No business logic lives here — that belongs in the service.
 */

import { validateContactForm } from '../utils/validators.js';
import { saveContactMessage }   from '../services/contactService.js';

/**
 * POST /api/contact
 *
 * @param {import('express').Request}  req
 * @param {import('express').Response} res
 */
export async function submitContact(req, res) {
  // ── 1. Extract ────────────────────────────────────────────
  const { name, email, subject, message } = req.body ?? {};

  // ── 2. Validate ───────────────────────────────────────────
  const validation = validateContactForm({ name, email, subject, message });

  if (!validation.valid) {
    return res.status(400).json({
      success: false,
      message: validation.errors[0], // Surface the first error — clean UX
      errors:  validation.errors,    // Full list for debugging / multi-field forms
    });
  }

  // Use trimmed values from the validator (whitespace already stripped)
  const { trimmed } = validation;

  // ── 3. Collect optional metadata ─────────────────────────
  // ip_address: respect X-Forwarded-For if behind a proxy (Vercel sets this)
  const forwardedFor = req.headers['x-forwarded-for'];
  const ipAddress =
    (typeof forwardedFor === 'string' ? forwardedFor.split(',')[0].trim() : null)
    ?? req.ip
    ?? null;

  const userAgent = req.headers['user-agent'] ?? null;

  // ── 4. Persist ────────────────────────────────────────────
  try {
    const { id } = await saveContactMessage({
      name:      trimmed.name,
      email:     trimmed.email,
      subject:   trimmed.subject,
      message:   trimmed.message,
      ipAddress,
      userAgent,
    });

    return res.status(201).json({
      success: true,
      message: 'Message sent successfully. I will get back to you soon!',
      id,      // Return the row ID — useful for frontend confirmation UX
    });
  } catch (err) {
    // Service layer throws errors with an optional statusCode
    const statusCode = err.statusCode ?? 500;
    const isClientError = statusCode < 500;

    if (!isClientError) {
      // Log server-side errors; don't leak details to the client
      console.error('[contactController] Unexpected error:', err);
    }

    return res.status(statusCode).json({
      success: false,
      message: isClientError
        ? err.message
        : 'An unexpected error occurred. Please try again later.',
    });
  }
}
