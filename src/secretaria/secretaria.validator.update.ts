import {body} from 'express-validator'

export const validateSecretariaUpdate = [
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
    .isLength({min: 7, max: 8}).withMessage('El DNI debe tener entre 7 y 8 numeros.')
    .notEmpty().withMessage('El DNI es obligatorio.'),

  body('email')
    .optional()
    .isEmail().withMessage('Debe proporcionar un correo válido.')
    .notEmpty().withMessage('El email es obligatorio.'),

  body('telefono')
    .optional()
    .isNumeric().withMessage('El teléfono debe ser númerico.'),

    body('password')
    .optional() 
    .isLength({ min: 8 }).withMessage('La contraseña debe tener al menos 8 caracteres')
    .matches(/[a-z]/).withMessage('La contraseña debe contener al menos una letra minúscula')
    .matches(/[A-Z]/).withMessage('La contraseña debe contener al menos una letra mayúscula')
    .matches(/\d/).withMessage('La contraseña debe contener al menos un número'),
];