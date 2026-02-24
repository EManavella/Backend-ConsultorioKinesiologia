import {body} from 'express-validator'
import { orm } from '../shared/db/orm.js';
import { Paciente } from './paciente.entity.js';

const em= orm.em;
export const validatePacienteUpdate = [
  body('nombre')
    .optional()
    .isString()
    .notEmpty().withMessage('El nombre es obligatorio'),

  body('apellido')
    .optional()
    .isString()
    .notEmpty().withMessage('El apellido es obligatorio.'),

  body('dni')
    .optional()
    .isNumeric()
    .isLength({ min: 7, max: 8 }).withMessage('El DNI debe tener entre 7 y 8 números.')
    .notEmpty().withMessage('El DNI es obligatorio.'),

  body('email')
    .optional()
    .isEmail().withMessage('Debe proporcionar un correo válido.')
    .notEmpty().withMessage('El mail es obligatorio.'),

  body('telefono')
    .optional()
    .isNumeric().withMessage('El teléfono debe ser un número.'),

  body('password')
    .optional()
    .isLength({ min: 8 }).withMessage('La contraseña debe tener al menos 8 caracteres')
    .matches(/[a-z]/).withMessage('La contraseña debe contener al menos una letra minúscula')
    .matches(/[A-Z]/).withMessage('La contraseña debe contener al menos una letra mayúscula')
    .matches(/\d/).withMessage('La contraseña debe contener al menos un número')
    .withMessage('La contraseña debe tener al menos 8 caracteres, 1 mayúscula, 1 minúscula y 1 número'),

  body('obraSocial')
    .optional()
    .isString()
    .notEmpty().withMessage('La obra social es obligatoria.'),
  
  body('fechaNacimiento')
    .optional()
    .isDate().withMessage('La fecha debe ser un formato valido.')
    .notEmpty().withMessage('La fecha no puede estar vacía.'),

  body('estado')
    .optional()
    .isString().withMessage('El estado debe ser una cadena.')
    .notEmpty().withMessage('El estado es obligatorio.')];
