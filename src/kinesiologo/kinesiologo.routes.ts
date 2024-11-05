import { Router } from 'express';
import {
  sanitizeKinesiologoInput,
  findAll,
  findOne,
  add,
  update,
  remove,
  login,
  logout
} from './kinesiologo.controler.js';
import { validateKinesiologo } from './kinesiologo.validator.js';
import { validarErrores } from '../middlewares/validacionErrores.js';
import { authToken } from '../middlewares/authToken.js';
import { manejoErrores } from '../middlewares/manejoErrores.js';

const kinesiologoRouter = Router();

// Acá definimos las rutas para cada método del controlador
kinesiologoRouter.get('/', authToken, findAll);
kinesiologoRouter.get('/:id', findOne);
kinesiologoRouter.post(
  '/',
  validateKinesiologo,
  validarErrores,
  sanitizeKinesiologoInput,
  add
);
kinesiologoRouter.put(
  '/:id',
  authToken,
  validateKinesiologo,
  validarErrores,
  sanitizeKinesiologoInput,
  update
);
kinesiologoRouter.patch(
  '/:id',
  validateKinesiologo,
  validarErrores,
  sanitizeKinesiologoInput,
  update
);
kinesiologoRouter.delete('/:id', authToken, remove);
kinesiologoRouter.post('/login', login);
kinesiologoRouter.post('/logout', logout);

import { Request, Response, NextFunction } from 'express';

kinesiologoRouter.use(
  (err: any, req: Request, res: Response, next: NextFunction) => {
    manejoErrores(err, req, res, next);
  }
);

export { kinesiologoRouter };
