
import { Router } from "express";
import { sanitizeTurnoInput, findAll, findOne, add, update, remove, creacionTurno, obtenerTurnosKine} from "./turno.controller.js";
import { validateTurno } from "./turno.validator.js";
import { validarErrores } from "../middlewares/validacionErrores.js";
import { authToken } from "../middlewares/authToken.js";

export const turnoRouter = Router()

turnoRouter.post('/turnoNuevo',authToken,creacionTurno)
turnoRouter.get('/pendientes/:kineId', authToken, obtenerTurnosKine)

turnoRouter.get('/', findAll)
turnoRouter.get('/:id', findOne)
turnoRouter.post('/',validateTurno, validarErrores,sanitizeTurnoInput, add)
turnoRouter.put('/:id',validateTurno, validarErrores,sanitizeTurnoInput, update)
turnoRouter.patch('/:id',validateTurno, validarErrores,sanitizeTurnoInput,  update)
turnoRouter.delete('/:id', remove)

