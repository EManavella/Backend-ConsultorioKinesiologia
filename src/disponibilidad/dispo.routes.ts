import { Router } from 'express';
import {
  sanitizedInput,
  findAll,
  findOne,
  add,
  update,
  remove,
  checkDisponibilidad,
  findPorKine,
} from './dispo.controller.js';
import { validateDispo } from './dispo.validator.js';
import { validarErrores } from '../middlewares/validacionErrores.js';
import { manejoErrores } from '../middlewares/manejoErrores.js';
import { Request, Response, NextFunction } from 'express';
import { authToken } from '../middlewares/authToken.js';

const dispoRouter = Router();

dispoRouter.get('/:fecha/:kinesiologoId/disponibilidad', checkDisponibilidad);
dispoRouter.get('/dispo/:kineId',authToken, findPorKine);

dispoRouter.get('/', findAll);
dispoRouter.get('/:id', findOne);
dispoRouter.post('/', validateDispo, validarErrores, sanitizedInput, add);
dispoRouter.put('/:id', validateDispo, validarErrores, sanitizedInput, update);
dispoRouter.patch(
  '/:id',
  validateDispo,
  validarErrores,
  sanitizedInput,
  update
);
dispoRouter.delete('/:id', remove);



dispoRouter.use((err: any, req: Request, res: Response, next: NextFunction) => {
  manejoErrores(err, req, res, next);
});

export { dispoRouter };
