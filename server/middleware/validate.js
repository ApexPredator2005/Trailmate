/**
 * server/middleware/validate.js — Input Sanitization & Zod Request Validation Middleware
 */

/**
 * Recursively sanitize all strings in an object or primitive:
 * - Trims whitespace
 * - Strips ASCII control characters (except standard newlines and tabs)
 * - Removes null bytes (\0)
 */
export function sanitizeValue(value) {
  if (typeof value === 'string') {
    // Strip null bytes and non-printable control characters (keep \r, \n, \t)
    return value
      .replace(/\0/g, '')
      .replace(/[\x01-\x08\x0B\x0C\x0E-\x1F\x7F]/g, '')
      .trim();
  }
  if (Array.isArray(value)) {
    return value.map(sanitizeValue);
  }
  if (value !== null && typeof value === 'object') {
    // Prevent prototype pollution
    const clean = {};
    for (const [k, v] of Object.entries(value)) {
      if (k === '__proto__' || k === 'constructor' || k === 'prototype') continue;
      clean[sanitizeValue(k)] = sanitizeValue(v);
    }
    return clean;
  }
  return value;
}

export function validateBody(schema) {
  return (req, res, next) => {
    // Sanitize incoming body before schema parse
    const sanitizedBody = sanitizeValue(req.body);
    const result = schema.safeParse(sanitizedBody);
    if (!result.success) {
      const formattedErrors = result.error.errors.map(err => ({
        path: err.path.join('.'),
        message: err.message,
      }));
      return res.status(400).json({
        error: 'Validation failed: malformed or oversized input',
        details: formattedErrors,
      });
    }
    req.body = result.data;
    next();
  };
}

export function validateQuery(schema) {
  return (req, res, next) => {
    // Sanitize incoming query parameters
    const sanitizedQuery = sanitizeValue(req.query);
    const result = schema.safeParse(sanitizedQuery);
    if (!result.success) {
      const formattedErrors = result.error.errors.map(err => ({
        path: err.path.join('.'),
        message: err.message,
      }));
      return res.status(400).json({
        error: 'Query parameter validation failed: malformed or invalid input',
        details: formattedErrors,
      });
    }
    req.query = result.data;
    next();
  };
}
