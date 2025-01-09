import { body } from 'express-validator';
import { Especialidad } from '../especialidad/especialidad.entity.js';
import { Consultorio } from '../consultorio/consultorio.entity.js';
import { orm } from '../shared/db/orm.js';
const em = orm.em;
export const validateKinesiologo = [
    body('nombre').isString().notEmpty().withMessage('El nombre es obligatorio'),
    body('apellido')
        .isString()
        .notEmpty()
        .withMessage('El apellido es obligatorio.'),
    body('dni')
        .isNumeric()
        .isLength({ min: 7, max: 8 })
        .withMessage('El DNI debe tener entre 7 y 8 numeros.')
        .notEmpty()
        .withMessage('El DNI es obligatorio.'),
    body('matricula')
        .isNumeric()
        .custom((value) => {
        if (!value.startsWith('541')) {
            throw new Error('La matricula debe comenzar con 541');
        }
        return true;
    }) //https://express-validator.github.io/docs/guides/customizing
        .isLength({ min: 11, max: 12 })
        .notEmpty()
        .withMessage('La matrícula es obligatoria.'),
    body('email').isEmail().withMessage('Debe proporcionar un correo válido.'),
    body('telefono').isNumeric().withMessage('El teléfono debe ser un número.'),
    body('password')
        .isLength({ min: 8 })
        .withMessage('La contraseña debe tener al menos 8 caracteres')
        .matches(/[a-z]/)
        .withMessage('La contraseña debe contener al menos una letra minúscula')
        .matches(/[A-Z]/)
        .withMessage('La contraseña debe contener al menos una letra mayúscula')
        .matches(/\d/)
        .withMessage('La contraseña debe contener al menos un número'),
    /*    .isStrongPassword({
        minLength: 8,
        minLowercase: 1,
        minUppercase: 1,
        minNumbers: 1,
      }).withMessage('La contraseña debe tener al menos 8 caracteres, 1 mayúscula, 1 minúscula y 1 número'),
  */
    body('especialidad')
        .notEmpty()
        .withMessage('La especialidad es obligatoria.')
        .isNumeric()
        .withMessage('La especialidad debe ser un ID numérico válido.')
        .custom(async (value) => {
        const especialidad = await em.findOne(Especialidad, { id: value });
        if (!especialidad) {
            throw new Error('El id de la especialidad no es válido.');
        }
        return true;
    }),
    body('consultorio')
        .isNumeric().withMessage('El consultorio debe ser un id numerico valido.')
        .notEmpty().withMessage('El consultorio es obligatorio.')
        .custom(async (value) => {
        const consultorio = await em.findOne(Consultorio, { id: value });
        if (!consultorio) {
            throw new Error('El id del consultorio no es válido.');
        }
        return true;
    })
];
/*...validateEspecialidad,

 body('consultorio')
   .isString()
   .notEmpty().withMessage('El consultorio es obligatorio.')


];
*/
// ('TURNO')
//# sourceMappingURL=kinesiologo.validator.js.map