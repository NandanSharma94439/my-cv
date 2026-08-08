/**
 * validators.js
 * -------------
 * Pure validation functions — no side effects, fully testable.
 * Returns a structured result object so callers get both the
 * pass/fail signal and a human-readable error message.
 */

import validator from 'validator';

// ── Field length limits ──────────────────────────────────────
export const LIMITS = {
  name:    { min: 2,  max: 100  },
  email:   { min: 5,  max: 254  },   // RFC 5321 max
  subject: { min: 3,  max: 150  },
  message: { min: 10, max: 3000 },
};

/**
 * Validates a single contact form submission.
 *
 * @param {object} body — raw request body
 * @returns {{ valid: boolean, errors: string[] }}
 */
export function validateContactForm(body) {
  const errors = [];

  const { name, email, subject, message } = body;

  // ── Required presence check ──────────────────────────────
  if (!name    || typeof name    !== 'string') errors.push('Name is required.');
  if (!email   || typeof email   !== 'string') errors.push('Email is required.');
  if (!subject || typeof subject !== 'string') errors.push('Subject is required.');
  if (!message || typeof message !== 'string') errors.push('Message is required.');

  // Short-circuit if required fields are missing entirely —
  // subsequent checks would throw on null.
  if (errors.length > 0) return { valid: false, errors };

  // ── Trim and re-assign for length checks ────────────────
  const trimmed = {
    name:    name.trim(),
    email:   email.trim(),
    subject: subject.trim(),
    message: message.trim(),
  };

  // ── Empty-after-trim check ───────────────────────────────
  if (!trimmed.name)    errors.push('Name cannot be empty or whitespace only.');
  if (!trimmed.email)   errors.push('Email cannot be empty or whitespace only.');
  if (!trimmed.subject) errors.push('Subject cannot be empty or whitespace only.');
  if (!trimmed.message) errors.push('Message cannot be empty or whitespace only.');

  if (errors.length > 0) return { valid: false, errors };

  // ── Email format ─────────────────────────────────────────
  if (!validator.isEmail(trimmed.email)) {
    errors.push('A valid email address is required.');
  }

  // ── Length bounds ────────────────────────────────────────
  if (!validator.isLength(trimmed.name, LIMITS.name)) {
    errors.push(
      `Name must be between ${LIMITS.name.min} and ${LIMITS.name.max} characters.`
    );
  }
  if (!validator.isLength(trimmed.subject, LIMITS.subject)) {
    errors.push(
      `Subject must be between ${LIMITS.subject.min} and ${LIMITS.subject.max} characters.`
    );
  }
  if (!validator.isLength(trimmed.message, LIMITS.message)) {
    errors.push(
      `Message must be between ${LIMITS.message.min} and ${LIMITS.message.max} characters.`
    );
  }

  return {
    valid: errors.length === 0,
    errors,
    // Return the trimmed values so the controller doesn't trim again
    trimmed,
  };
}
