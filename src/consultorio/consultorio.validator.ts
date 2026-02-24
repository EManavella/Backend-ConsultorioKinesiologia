import {body} from 'express-validator'
import { orm } from '../shared/db/orm.js';
import { Consultorio } from './consultorio.entity.js';

const em = orm.em;
export const validateConsultorio = [
  body('nombre')
    .isString()
    .notEmpty().withMessage('El nombre es obligatorio'),
  
  body('domicilio')
    .isString()
    .notEmpty().withMessage('El domicilio es obligatorio.')
    .custom(async (value) => {
      const existe = await em.findOne(Consultorio, { domicilio: value });
      if (existe) {
        throw new Error('Ya existe un consultorio con este domicilio.');
      }
      return true;
    })
];