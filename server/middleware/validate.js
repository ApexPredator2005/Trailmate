/**
 * server/middleware/validate.js — Zod Request Validation Middleware
 * (Suggestion #25)
 */

export function validateBody(schema) {
  return (req, res, next) => {
    const result = schema.safeParse(req.body);
    if (!result.success) {
      const formattedErrors = result.error.errors.map(err => ({
        path: err.path.join('.'),
        message: err.message,
      }));
      return res.status(400).json({
        error: 'Validation failed',
        details: formattedErrors,
      });
    }
    req.body = result.data;
    next();
  };
}

export function validateQuery(schema) {
  return (req, res, next) => {
    const result = schema.safeParse(req.query);
    if (!result.success) {
      const formattedErrors = result.error.errors.map(err => ({
        path: err.path.join('.'),
        message: err.message,
      }));
      return res.status(400).json({
        error: 'Query parameter validation failed',
        details: formattedErrors,
      });
    }
    req.query = result.data;
    next();
  };
}
