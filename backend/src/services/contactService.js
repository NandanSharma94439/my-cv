/**
 * contactService.js
 * -----------------
 * All database interaction for the contact_messages table.
 *
 * This layer has ONE responsibility: talk to the database.
 * No HTTP knowledge, no Express objects — fully unit-testable.
 *
 * SQL injection protection:
 *   The Supabase JS SDK uses parameterized queries internally.
 *   We never concatenate user data into query strings.
 */

import supabase from '../config/supabase.js';
import { v4 as uuidv4 } from 'uuid';
import { sendContactNotification } from './emailService.js';

// ── Duplicate submission window ───────────────────────────────
// Reject a second submission from the same email + same subject
// within this many minutes.
const DUPLICATE_WINDOW_MINUTES = 10;

/**
 * Checks whether a near-identical submission already exists
 * in the database within the duplicate window.
 *
 * @param {string} email
 * @param {string} subject
 * @returns {Promise<boolean>} — true if a duplicate is found
 */
async function isDuplicate(email, subject) {
  const windowStart = new Date(
    Date.now() - DUPLICATE_WINDOW_MINUTES * 60 * 1000
  ).toISOString();

  const { data, error } = await supabase
    .from('contact_messages')
    .select('id')
    .eq('email', email)
    .eq('subject', subject)
    .gte('created_at', windowStart)
    .limit(1);

  if (error) {
    // If the duplicate check itself fails, log it but don't block
    // the submission — better to accept a duplicate than to
    // incorrectly reject a legitimate message.
    console.error('[contactService] Duplicate check failed:', error.message);
    return false;
  }

  return data && data.length > 0;
}

/**
 * Inserts a validated contact message into Supabase.
 *
 * @param {object} params
 * @param {string} params.name
 * @param {string} params.email
 * @param {string} params.subject
 * @param {string} params.message
 * @param {string} [params.ipAddress]   — caller's IP (optional)
 * @param {string} [params.userAgent]   — caller's UA string (optional)
 *
 * @returns {Promise<{ id: string }>}   — the newly created row ID
 * @throws  {Error}                     — on DB error or duplicate
 */
export async function saveContactMessage({
  name,
  email,
  subject,
  message,
  ipAddress,
  userAgent,
}) {
  // ── Duplicate guard ─────────────────────────────────────
  const duplicate = await isDuplicate(email, subject);
  if (duplicate) {
    const err = new Error(
      'A message with this email and subject was already submitted recently. ' +
      `Please wait ${DUPLICATE_WINDOW_MINUTES} minutes before resubmitting.`
    );
    err.statusCode = 429;
    throw err;
  }

  // ── Build the row ───────────────────────────────────────
  const row = {
    id:         uuidv4(),
    name,
    email,
    subject,
    message,
    ip_address: ipAddress  ?? null,
    user_agent: userAgent  ?? null,
    status:     'new',
    // created_at is set by the DB DEFAULT NOW()
  };

  // ── Insert ──────────────────────────────────────────────
  const { data, error } = await supabase
    .from('contact_messages')
    .insert(row)
    .select('id')
    .single();

  if (error) {
    console.error('[contactService] Insert failed:', error.message);
    const err = new Error('Failed to save your message. Please try again.');
    err.statusCode = 503;
    throw err;
  }

  // ── Send Email Notification (Awaited for Vercel Serverless execution) ──
  try {
    await sendContactNotification({
      name,
      email,
      subject,
      message,
      id: data.id,
    });
  } catch (err) {
    console.error('[contactService] Email notification error:', err);
  }

  return { id: data.id };
}
