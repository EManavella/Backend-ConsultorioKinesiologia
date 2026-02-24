import { Router } from 'express'
import { sanitizePrecioInput, findAll, findOne, add, update, remove } from './precio.controller.js'
import { validarErrores } from '../middlewares/validacionErrores.js'
import { validatePrecio } from './precio.validator.js'



const precioRouter = Router()

precioRouter.get('/', findAll)
precioRouter.get('/:id', findOne)
precioRouter.post('/', validatePrecio, validarErrores, sanitizePrecioInput,add)
precioRouter.put('/:id', validatePrecio ,validarErrores, sanitizePrecioInput, update)
precioRouter.patch('/:id', validatePrecio, validarErrores, sanitizePrecioInput, update)
precioRouter.delete('/:id', remove)


export {precioRouter};

