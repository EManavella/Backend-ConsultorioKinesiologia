import {body} from 'express-validator'

export const validatePrecio = [
  body('fechaDesde')
    .isDate().withMessage('La fecha debe ser un formato valido.')
    .notEmpty().withMessage('La fecha no puede estar vacía.'),
  body('importe')
    .isFloat({min:0}).withMessage('El precio debe ser un numero positivo con decimales.')
    .notEmpty().withMessage('El precio no puede estar vacío.'),
];
