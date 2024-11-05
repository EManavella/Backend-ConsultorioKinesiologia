import { Router } from 'express';
import {
  sanitizeSecretariaInput,
  findAll,
  findOne,
  add,
  update,
  remove,
  login,
  logout
} from './secretaria.controler.js';
import { validateSecretaria } from './secretaria.validator.js';
import { validarErrores } from '../middlewares/validacionErrores.js';
import { manejoErrores } from '../middlewares/manejoErrores.js';
import { Request, Response, NextFunction } from 'express';
import { authToken } from '../middlewares/authToken.js';

const secretariaRouter = Router();

secretariaRouter.get('/', findAll);
secretariaRouter.get('/:id', findOne);
secretariaRouter.post(
  '/',
  validateSecretaria,
  validarErrores,
  sanitizeSecretariaInput,
  add
);
secretariaRouter.put(
  '/:id',
  validateSecretaria,
  validarErrores,
  sanitizeSecretariaInput,
  update
);
secretariaRouter.patch(
  '/:id',
  validateSecretaria,
  validarErrores,
  sanitizeSecretariaInput,
  update
);
secretariaRouter.delete('/:id', remove);
secretariaRouter.post('/login', login);
secretariaRouter.post('/logout', logout);

secretariaRouter.use(
  (err: any, req: Request, res: Response, next: NextFunction) => {
    manejoErrores(err, req, res, next);
  }
);

export { secretariaRouter };
