import { Request, Response, NextFunction } from 'express';

export function authorizeRole(...allowedRoles: string[]) {
  return (req: Request, res: Response, next: NextFunction) => {
    if (!req.user || !allowedRoles.includes(req.user.role)) {
      return res.status(403).json({ message: 'Acceso denegado. Permisos insuficientes.' });
    }
    next();
  };
}