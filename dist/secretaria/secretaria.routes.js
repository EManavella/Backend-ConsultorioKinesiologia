import { Router } from 'express';
import { sanitizeSecretariaInput, findAll, findOne, add, update, remove, login, logout } from './secretaria.controler.js';
import { validateSecretaria } from './secretaria.validator.js';
import { validarErrores } from '../middlewares/validacionErrores.js';
import { manejoErrores } from '../middlewares/manejoErrores.js';
import { authToken } from '../middlewares/authToken.js';
const secretariaRouter = Router();
secretariaRouter.get('/', findAll);
secretariaRouter.get('/:id', findOne);
secretariaRouter.post('/', authToken, validateSecretaria, validarErrores, sanitizeSecretariaInput, add);
secretariaRouter.put('/:id', validateSecretaria, validarErrores, sanitizeSecretariaInput, update);
secretariaRouter.patch('/:id', validateSecretaria, validarErrores, sanitizeSecretariaInput, update);
secretariaRouter.delete('/:id', remove);
secretariaRouter.post('/login', login);
secretariaRouter.post('/logout', logout);
secretariaRouter.use((err, req, res, next) => {
    manejoErrores(err, req, res, next);
});
export { secretariaRouter };
//# sourceMappingURL=secretaria.routes.js.map