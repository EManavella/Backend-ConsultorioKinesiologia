import { body } from 'express-validator';
import { Kinesiologo } from '../kinesiologo/kinesiologo.entity.js';
import { Paciente } from '../paciente/paciente.entity.js';
import { orm } from '../shared/db/orm.js';
import { Turno } from './turno.entity.js';



const em = orm.em;

export const validateTurno = [
  body('fecha')
  .isDate().withMessage('La fecha es incorrecta (YYY-MM-DD).')
  .notEmpty().withMessage('La fecha es obligatoria.'),

  body('hora')
  .notEmpty().withMessage('La hora es obligatoria.')
  .custom(async (value, { req }) => {
    const kinesiologo = req.body.kinesiologo;
    const fechaString = req.body.fecha;
    const hora = value;

    // Convierte la fecha de string a Date
    const fecha = new Date(fechaString);

    // Verifica si ya existe un turno con el mismo kinesiólogo, fecha y hora
    const turnoExistente = await em.findOne(Turno, {
      kinesiologo: kinesiologo,
      fecha: fecha,  // 'fecha' es un objeto Date
      hora: hora
    });

    if (turnoExistente) {
      throw new Error('El kinesiólogo ya tiene un turno asignado en ese horario.');
    }

    return true;
  }),
  

  body('kinesiologo')
  .isInt()
  .notEmpty().withMessage('El kinesiologo es obligatorio.')
  .custom(async (value) => {
    const existe = await em.findOne(Kinesiologo, {id: value});
    if (!existe) {
      throw new Error('El kinesiologo no existe.');
    }
    return true;
  }),
  

  body('paciente')
  .isInt()
  .notEmpty().withMessage('El paciente es obligatorio.')
  .custom(async (value) => {
    const existe = await em.findOne(Paciente, {id: value});
    if (!existe) {
      throw new Error('El paciente no existe.');
    }
    return true;
  }),
];