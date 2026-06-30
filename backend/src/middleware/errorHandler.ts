import { Request, Response, NextFunction } from 'express';

export function errorHandler(
  err: Error,
  req: Request,
  res: Response,
  next: NextFunction
) {
  const isDev = process.env.NODE_ENV === 'development';
  const customErr = err as any;
  const status = customErr.status || customErr.statusCode || 500;
  
  // Log details
  if (isDev) {
    console.error('API Error Detail:', err);
  } else {
    console.error(`API Error [${status}]:`, err.message || 'Internal server error');
  }

  // Return structured response
  return res.status(status).json({
    error: err.message || 'Internal Server Error',
    code: customErr.code || 'INTERNAL_ERROR',
    timestamp: new Date().toISOString(),
    ...(isDev && { stack: err.stack })
  });
}
