import { validationResult } from 'express-validator';
import { Request, Response, NextFunction } from 'express';

function validarErrores(req: Request, res: Response, next: NextFunction): void {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    res.status(400).json({
      message: 'Error de validación',
      errors: errors.array(),
    });
    return;
  }
  next();
}

export { validarErrores };