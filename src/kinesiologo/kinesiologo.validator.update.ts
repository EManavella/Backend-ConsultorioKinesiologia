//  Tuve que hacer esta validación nueva para poder agregar que algunas validaciones 
// sean opcionales para poder enviar solo algunos campos a actualizar
import { body } from 'express-validator';
import { Especialidad } from '../especialidad/especialidad.entity.js';
import { Consultorio } from '../consultorio/consultorio.entity.js'; 
import { orm } from '../shared/db/orm.js';

const em = orm.em;

export const validateKinesiologoUpdate = [
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

  body('matricula')
    .optional()
    .isNumeric()
    .custom((value) => {
      if (!value.startsWith('541')) {
        throw new Error('La matrícula debe comenzar con 541');
      }
      return true;
    })
    .isLength({ min: 11, max: 12 })
    .notEmpty().withMessage('La matrícula es obligatoria.'),

  body('email')
    .optional()
    .isEmail().withMessage('Debe proporcionar un correo válido.'),

  body('telefono')
    .optional()
    .isNumeric().withMessage('El teléfono debe ser un número.'),

  body('password')
    .optional()
    .isLength({ min: 8 }).withMessage('La contraseña debe tener al menos 8 caracteres')
    .matches(/[a-z]/).withMessage('La contraseña debe contener al menos una letra minúscula')
    .matches(/[A-Z]/).withMessage('La contraseña debe contener al menos una letra mayúscula')
    .matches(/\d/).withMessage('La contraseña debe contener al menos un número'),

  body('especialidad')
    .optional()
    .isString().withMessage('La especialidad debe ser una cadena de texto.')
    .notEmpty().withMessage('La especialidad es obligatoria.')
    .custom(async (value) => {
      const especialidad = await em.findOne(Especialidad, { nombre: value });
      if (!especialidad) {
        throw new Error('El nombre de la especialidad no es válido.');
      }
      return true;
    }),

  body('consultorio')
    .optional()
    .isString().withMessage('El consultorio debe ser una cadena de texto.')
    .notEmpty().withMessage('El consultorio es obligatorio.')
    .custom(async (value) => {
      const consultorio = await em.findOne(Consultorio, { nombre: value });
      if (!consultorio) {
        throw new Error('El nombre del consultorio no es válido.');
      }
      return true;
    })
];
