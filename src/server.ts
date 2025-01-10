import dotenv from 'dotenv';
dotenv.config();

import 'reflect-metadata';
import express from 'express';
import { secretariaRouter } from './secretaria/secretaria.routes.js';
import { orm, syncSchema } from './shared/db/orm.js';
import { RequestContext } from '@mikro-orm/core';
import { consultorioRouter } from './consultorio/consultorio.routes.js';
import { especialidadRouter } from './especialidad/especialidad.routes.js';
import { kinesiologoRouter } from './kinesiologo/kinesiologo.routes.js';
import { turnoRouter } from './turnos/turno.routes.js';
import { pacienteRouter } from './paciente/paciente.routes.js';
import { precioRouter } from './precio/precio.routes.js';
import { dispoRouter } from './disponibilidad/dispo.routes.js';
import cookieParser from 'cookie-parser';
import cors from 'cors';

const app = express();
app.use(express.json());

app.use(cors({
  origin: ["http://localhost:5173"], // Usá un array de orígenes permitidos
  credentials: true,
}));

app.use(cookieParser()); // Proceso de cookies

app.use((req, res, next) => {
  RequestContext.create(orm.em, next); // em (Entity Manager)
});

//antes de las rutas y middlewares de negocio

app.use('/api/consultorios', consultorioRouter);
app.use('/api/secretarias', secretariaRouter);
app.use('/api/kinesiologos', kinesiologoRouter);
app.use('/api/especialidades', especialidadRouter);
app.use('/api/turnos', turnoRouter);
app.use('/api/pacientes', pacienteRouter);
app.use('/api/precios', precioRouter);
app.use('/api/disponibilidad', dispoRouter);


app.use((_, res) => {
  return res.status(404).send({ message: 'Resource not found' });
});

await syncSchema(); //never in production

app.listen(3000, () => {
  console.log('Server runnning on http://localhost:3000/');
});
