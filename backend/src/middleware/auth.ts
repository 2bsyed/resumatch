import { Request, Response, NextFunction } from 'express';
import { supabase } from '../db/supabase';

export interface AuthenticatedRequest extends Request {
  user?: {
    id: string;
    email: string;
  };
}

export const authMiddleware = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
) => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Unauthorized: no token provided' });
  }
  
  const token = authHeader.split(' ')[1];
  
  const { data, error } = await supabase.auth.getUser(token);
  
  if (error || !data.user) {
    return res.status(401).json({ error: 'Unauthorized: invalid token' });
  }
  
  req.user = { id: data.user.id, email: data.user.email! };
  next();
};
