import { body } from 'express-validator';
import { orm } from '../shared/db/orm.js';
import { Especialidad } from './especialidad.entity.js';

const em = orm.em;

export const validateEspecialidad = [
  body('nombre')
    .isString()
    .withMessage('El nombre de la especialidad debe ser alfabético.')
    .notEmpty()
    .withMessage('El nombre de la especialidad es obligatorio.')
    .custom(async (value) => {
      const existe = await em.findOne(Especialidad, { nombre: value });
      if (existe) {
        throw new Error('La especialidad ya existe.');
      }
      return true;
    }),
];