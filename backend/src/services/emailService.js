/**
 * emailService.js
 * ---------------
 * Sends email notifications for new contact form submissions via Resend.
 */

import { Resend } from 'resend';
import 'dotenv/config';

const resendApiKey = process.env.RESEND_API_KEY;
const notifyEmail = process.env.NOTIFY_EMAIL;

const resend = resendApiKey ? new Resend(resendApiKey) : null;

/**
 * Sends a notification email to the portfolio owner when a new message is received.
 *
 * @param {object} params
 * @param {string} params.name
 * @param {string} params.email
 * @param {string} params.subject
 * @param {string} params.message
 * @param {string} [params.id]
 */
export async function sendContactNotification({ name, email, subject, message, id }) {
  if (!resend) {
    console.warn('[emailService] RESEND_API_KEY missing. Skipping email notification.');
    return { success: false, skipped: true };
  }

  const htmlContent = `
    <div style="font-family: 'Segoe UI', Arial, sans-serif; max-width: 600px; margin: 0 auto; background: #faf8f3; border: 1px solid #e2ddd5; border-radius: 12px; padding: 24px; color: #2d2b2a;">
      <h2 style="color: #6b5b95; margin-top: 0; font-size: 20px; border-bottom: 2px solid #e2ddd5; padding-bottom: 12px;">
        📬 New Portfolio Contact Message
      </h2>
      
      <table style="width: 100%; border-collapse: collapse; margin-bottom: 20px;">
        <tr>
          <td style="padding: 8px 0; font-weight: bold; width: 100px; color: #7a6e65;">From:</td>
          <td style="padding: 8px 0;">${name} (&lt;<a href="mailto:${email}" style="color: #6b5b95;">${email}</a>&gt;)</td>
        </tr>
        <tr>
          <td style="padding: 8px 0; font-weight: bold; color: #7a6e65;">Subject:</td>
          <td style="padding: 8px 0; font-weight: 600;">${subject}</td>
        </tr>
      </table>

      <div style="background: #ffffff; border-left: 4px solid #6b5b95; border-radius: 4px; padding: 16px; margin-bottom: 20px; font-size: 15px; line-height: 1.6; white-space: pre-wrap; color: #333333;">
${message}
      </div>

      <div style="font-size: 12px; color: #8c827a; border-top: 1px solid #e2ddd5; padding-top: 12px; text-align: right;">
        Message ID: ${id || 'N/A'}<br>
        Sent from your Portfolio Contact Form
      </div>
    </div>
  `;

  try {
    const data = await resend.emails.send({
      from: 'Portfolio Contact <onboarding@resend.dev>',
      to: [notifyEmail],
      subject: `[Portfolio Contact] ${subject} - from ${name}`,
      html: htmlContent,
      replyTo: email,
    });

    console.log('[emailService] Email sent successfully via Resend:', data);
    return { success: true, data };
  } catch (error) {
    console.error('[emailService] Failed to send email notification:', error.message);
    // Non-blocking: We don't fail the API call if email delivery fails, but we log it
    return { success: false, error: error.message };
  }
}
