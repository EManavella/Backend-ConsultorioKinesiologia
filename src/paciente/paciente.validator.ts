import {body} from 'express-validator'
import { orm } from '../shared/db/orm.js';
import { Paciente } from './paciente.entity.js';

const em= orm.em;
export const validatePaciente = [
  body('nombre')
    .isString()
    .notEmpty().withMessage('El nombre es obligatorio'),

  body('apellido')
    .isString()
    .notEmpty().withMessage('El apellido es obligatorio.'),

  body('dni')
    .isNumeric()
    .isLength({min: 7, max: 8}).withMessage('El DNI debe tener entre 7 y 8 numeros.')
    .notEmpty().withMessage('El DNI es obligatorio.')
    .custom(async (value) => {
      const existe = await em.findOne(Paciente, { dni: value })
      if (existe) {
        throw new Error('Ya existe un paciente con este DNI.')
      }
      return true;
    }),

  body('email')
    .isEmail().withMessage('Debe proporcionar un correo válido.')
    .notEmpty().withMessage('El mail es obligatorio.'),

  body('telefono')
    .isNumeric().withMessage('El teléfono debe ser un número.'),

  body('password')
    .isLength({ min: 8 }).withMessage('La contraseña debe tener al menos 8 caracteres')
    .matches(/[a-z]/).withMessage('La contraseña debe contener al menos una letra minúscula')
    .matches(/[A-Z]/).withMessage('La contraseña debe contener al menos una letra mayúscula')
    .matches(/\d/).withMessage('La contraseña debe contener al menos un número')
    .withMessage('La contraseña debe tener al menos 8 caracteres, 1 mayúscula, 1 minúscula y 1 número'),

  body('obraSocial')
    .isString()
    .notEmpty().withMessage('La obra social es obligatoria.'),

  body('fechaNacimiento')
    .isDate().withMessage('La fecha debe ser un formato valido.')
    .notEmpty().withMessage('La fecha no puede estar vacía.')];

/*body('estado')
  .isString().withMessage('El estado debe ser una cadena.')
  .notEmpty().withMessage('El estado es obligatorio.'),

*/ 