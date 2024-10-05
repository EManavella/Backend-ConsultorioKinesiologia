import { Router } from 'express';
import { sanitizedInput, findAll, findOne, add, update, remove } from './dispo.controller.js';
import { validateDispo } from './dispo.validator.js';
import { validarErrores } from '../middlewares/validacionErrores.js';
import { manejoErrores } from '../middlewares/manejoErrores.js';
const dispoRouter = Router();
dispoRouter.get('/', findAll);
dispoRouter.get('/:id', findOne);
dispoRouter.post('/', validateDispo, validarErrores, sanitizedInput, add);
dispoRouter.put('/:id', validateDispo, validarErrores, sanitizedInput, update);
dispoRouter.patch('/:id', validateDispo, validarErrores, sanitizedInput, update);
dispoRouter.delete('/:id', remove);
dispoRouter.use((err, req, res, next) => {
    manejoErrores(err, req, res, next);
});
export { dispoRouter };
//# sourceMappingURL=dispo.routes.js.map