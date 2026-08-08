/**
 * server.js
 * ---------
 * HTTP server entry point.
 *
 * Responsibilities:
 *   - Read PORT from environment
 *   - Start listening
 *   - Handle graceful shutdown on SIGTERM / SIGINT
 */

import app from './app.js';

const PORT = parseInt(process.env.PORT ?? '3000', 10);

const server = app.listen(PORT, () => {
  console.log(`\n✅  Server running on http://localhost:${PORT}`);
  console.log(`    Health check: http://localhost:${PORT}/health`);
  console.log(`    Contact API:  http://localhost:${PORT}/api/contact\n`);
});

// ─────────────────────────────────────────────────────────────
// GRACEFUL SHUTDOWN
// Closes the server cleanly so in-flight requests finish
// before the process exits. Important for Vercel, PM2, Docker.
// ─────────────────────────────────────────────────────────────
function shutdown(signal) {
  console.log(`\n⚠️   ${signal} received — shutting down gracefully...`);
  server.close(() => {
    console.log('✅  HTTP server closed.');
    process.exit(0);
  });

  // Force-exit after 10 s if server hasn't closed
  setTimeout(() => {
    console.error('❌  Forced shutdown after timeout.');
    process.exit(1);
  }, 10_000);
}

process.on('SIGTERM', () => shutdown('SIGTERM'));
process.on('SIGINT',  () => shutdown('SIGINT'));

export default app;
