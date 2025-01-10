//Acá hacemos una especie de índice por cada módulo
import { Request, Response, NextFunction } from 'express';
import { Router } from 'express';
import {
  findAll,
  findOne,
  add,
  update,
  remove,
  sanitizePacienteInput,
  login,
  logout,
  obtenerTurnos,
  obtenerPaciente
} from './paciente.controller.js';
import { validatePaciente } from './paciente.validator.js';
import { validatePacienteUpdate } from './paciente.validator.update.js';
import { validarErrores } from '../middlewares/validacionErrores.js';
import { manejoErrores } from '../middlewares/manejoErrores.js';
import { authToken } from '../middlewares/authToken.js';
import { authorizeRole } from '../middlewares/authorizeToken.js';

const pacienteRouter = Router();

pacienteRouter.post('/login', login)
pacienteRouter.get('/turnos', authToken,authorizeRole('P'), obtenerTurnos)

pacienteRouter.post('/logout', logout);

/*Le definimos el directorio raiz, porque si queremos hacer una modificación.
De esta manera no queda atada y podemos utilizar la ruta que necesitemos en app.ts 
*/
pacienteRouter.get('/', findAll);
pacienteRouter.get('/:id', findOne);
pacienteRouter.get('/k/:id', authToken,authorizeRole('P'), obtenerPaciente);
pacienteRouter.post(
  '/',
  validatePaciente,
  validarErrores,
  sanitizePacienteInput,
  add,
  login,
);
pacienteRouter.put(
  '/:id',
  authToken,
  authorizeRole('P'),
  validatePaciente,
  validarErrores,
  sanitizePacienteInput,
  update
);
/*pacienteRouter.patch(
  '/:id',
  authToken,
  validatePaciente,
  validarErrores,
  sanitizePacienteInput,
  update
);*/

pacienteRouter.patch(
  '/k/:id',
  authToken,
  authorizeRole('P'),
  validatePacienteUpdate,
  validarErrores,
  sanitizePacienteInput,
  update
);


pacienteRouter.delete('/:id', authToken, authorizeRole('S'),remove);



pacienteRouter.use(
  (err: any, req: Request, res: Response, next: NextFunction) => {
    manejoErrores(err, req, res, next);
  }
);

export { pacienteRouter };
