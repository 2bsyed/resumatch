import { Request, Response, NextFunction } from 'express';

export function errorHandler(
  err: any,
  req: Request,
  res: Response,
  next: NextFunction
) {
  const isDev = process.env.NODE_ENV === 'development';
  const status = err.status || err.statusCode || 500;
  
  // Log details
  if (isDev) {
    console.error('API Error Detail:', err);
  } else {
    console.error(`API Error [${status}]:`, err.message || 'Internal server error');
  }

  // Return structured response
  return res.status(status).json({
    error: err.message || 'Internal Server Error',
    code: err.code || 'INTERNAL_ERROR',
    timestamp: new Date().toISOString(),
    ...(isDev && { stack: err.stack })
  });
}
