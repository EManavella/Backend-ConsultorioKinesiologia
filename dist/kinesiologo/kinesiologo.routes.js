import { Router } from 'express';
import { sanitizeKinesiologoInput, findOne, obtenerKinesiologo, add, update, remove, login, logout, findKineByEspCon, findPorConsul, } from './kinesiologo.controler.js';
import { validateKinesiologo } from './kinesiologo.validator.js';
import { validateKinesiologoUpdate } from './kinesiologo.validator.update.js';
import { validarErrores } from '../middlewares/validacionErrores.js';
import { authToken } from '../middlewares/authToken.js';
import { authorizeRole } from '../middlewares/authorizeToken.js';
import { manejoErrores } from '../middlewares/manejoErrores.js';
import { obtenerTurnosKinesiologo } from './kinesiologo.controler.js';
const kinesiologoRouter = Router();
kinesiologoRouter.post('/login', login);
kinesiologoRouter.get('/turnos', authToken, authorizeRole('K'), obtenerTurnosKinesiologo);
kinesiologoRouter.get('/consul', authToken, findPorConsul);
kinesiologoRouter.get('/:especialidadId', authToken, findKineByEspCon);
kinesiologoRouter.get('/:id', findOne);
kinesiologoRouter.get('/k/:id', authToken, authorizeRole('K'), obtenerKinesiologo);
kinesiologoRouter.post('/', authToken, authorizeRole('S'), validateKinesiologo, validarErrores, sanitizeKinesiologoInput, add);
kinesiologoRouter.put('/:id', authToken, authorizeRole('K'), validateKinesiologo, validarErrores, sanitizeKinesiologoInput, update);
kinesiologoRouter.patch('/k/:id', authToken, authorizeRole('K'), validateKinesiologoUpdate, validarErrores, sanitizeKinesiologoInput, update);
kinesiologoRouter.delete('/:id', authToken, authorizeRole('S'), remove);
kinesiologoRouter.post('/logout', logout);
kinesiologoRouter.use((err, req, res, next) => {
    manejoErrores(err, req, res, next);
});
export { kinesiologoRouter };
//# sourceMappingURL=kinesiologo.routes.js.map