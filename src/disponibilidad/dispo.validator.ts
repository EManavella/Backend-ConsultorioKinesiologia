import { body } from 'express-validator';
import { Kinesiologo } from '../kinesiologo/kinesiologo.entity.js';
import { orm } from '../shared/db/orm.js';

const em = orm.em;

export const validateDispo = [
  /*body('fechaDesde')
    .isDate()
    .withMessage('La fecha es obligatoria y debe ser una fecha válida.')
    .notEmpty()
    .withMessage('La fecha es obligatoria.'),
*/
  body('diaSemana')
    .isString()
    .withMessage('El día debe ser una cadena de texto.')
    .notEmpty()
    .withMessage('El día es obligatorio.')
    .custom((value) => {
      const diasValidos = [
        'lunes',
        'martes',
        'miércoles',
        'jueves',
        'viernes',
        'sábado',
      ];
      const diaLowerCase = value.toLowerCase().trim();
      if (!diasValidos.includes(diaLowerCase)) {
        throw new Error('El día de la semana no es válido.');
      }
      // Normaliza el día a formato título (primera letra mayúscula)
      return diaLowerCase.charAt(0).toUpperCase() + diaLowerCase.slice(1);
    })
    .customSanitizer((value) => {
      // Me Aseguro de que el día se guarde con la primera letra en mayúscula
      const diaLowerCase = value.toLowerCase().trim();
      return diaLowerCase.charAt(0).toUpperCase() + diaLowerCase.slice(1);
    }),
  body('horaInicio')
    .notEmpty()
    .withMessage('La hora de inicio es obligatoria.')
    .custom((value) => {
      const [hours, minutes] = value.split(':').map(Number);
      if (
        isNaN(hours) ||
        isNaN(minutes) ||
        hours < 0 ||
        hours > 23 ||
        minutes < 0 ||
        minutes > 59
      ) {
        throw new Error(
          'La hora de inicio debe estar en formato HH:mm y ser válida.'
        );
      }
      return true;
    }),
  body('horaFin')
    .notEmpty()
    .withMessage('La hora de fin es obligatoria.')
    .custom((value) => {
      const [hours, minutes] = value.split(':').map(Number);
      if (
        isNaN(hours) ||
        isNaN(minutes) ||
        hours < 0 ||
        hours > 23 ||
        minutes < 0 ||
        minutes > 59
      ) {
        throw new Error(
          'La hora de fin debe estar en formato HH:mm y ser válida.'
        );
      }
      return true;
    }),
  /* body('kinesiologo')
    .isString()
    .withMessage('La matrícula del kinesiólogo debe ser una cadena de texto.')
    .notEmpty()
    .withMessage('La matrícula del kinesiólogo es obligatoria.')
    .matches(/^541\d{8,9}$/)
    .withMessage('La matrícula debe comenzar con 541 y tener entre 11 y 12 dígitos en total.')
    .custom(async (value) => {
      // Primero, verificamos el formato
      if (!/^541\d{8,9}$/.test(value)) {
        throw new Error('El formato de la matrícula no es válido.');
      }
      
      // Luego, buscamos el kinesiólogo en la base de datos
      const kinesiologo = await em.findOne(Kinesiologo, { matricula: value });
      if (!kinesiologo) {
        throw new Error('No se encontró un kinesiólogo con la matrícula proporcionada.');
      }
      return true;
    }),
*/
  // Validación adicional para asegurar que horaFin sea posterior a horaInicio
  body().custom((value) => {
    const { horaInicio, horaFin } = value;
    if (horaInicio && horaFin) {
      const inicio = new Date(`1970-01-01T${horaInicio}`);
      const fin = new Date(`1970-01-01T${horaFin}`);
      if (fin <= inicio) {
        throw new Error(
          'La hora de fin debe ser posterior a la hora de inicio.'
        );
      }
    }
    return true;
  }),
];
