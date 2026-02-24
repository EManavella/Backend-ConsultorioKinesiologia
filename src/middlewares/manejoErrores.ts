import { AnyEntity } from '@mikro-orm/core';
import { Request, Response, NextFunction } from 'express';

function manejoErrores(err: AnyEntity, req: Request, res: Response, next: NextFunction): Response | void {
  console.error(err); 

  const statusCode = err.status || 500; 
  const message = err.message || 'Ha ocurrido un error inesperado.';

  // Envio respuesta de error
  res.status(statusCode).json({
    success: false,
    message,
  });
}

export { manejoErrores };