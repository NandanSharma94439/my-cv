/**
 * sanitize.js
 * -----------
 * Express middleware that sanitizes every string field in
 * req.body before it reaches any controller or service.
 *
 * Strategy:
 *  - Strip ALL HTML tags (prevents XSS and HTML injection)
 *  - Strip null bytes (prevents DB null-byte attacks)
 *  - Does NOT mutate non-string fields
 */

/**
 * Strips HTML tags and null bytes from a string.
 * @param {string} str
 * @returns {string}
 */
function stripHtmlTags(str) {
  return str.replace(/<[^>]*>?/gm, '').replace(/\0/g, '');
}

/**
 * Recursively strips HTML from every string value in an object.
 * @param {unknown} value
 * @returns {unknown}
 */
function deepSanitize(value) {
  if (typeof value === 'string') {
    return stripHtmlTags(value);
  }
  if (Array.isArray(value)) {
    return value.map(deepSanitize);
  }
  if (value !== null && typeof value === 'object') {
    return Object.fromEntries(
      Object.entries(value).map(([k, v]) => [k, deepSanitize(v)])
    );
  }
  return value;
}

/**
 * Middleware: sanitize req.body in-place.
 */
export function sanitizeBody(req, _res, next) {
  if (req.body && typeof req.body === 'object') {
    req.body = deepSanitize(req.body);
  }
  next();
}
