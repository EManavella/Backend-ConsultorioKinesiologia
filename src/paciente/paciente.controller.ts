import { Request, Response, NextFunction } from 'express';
import { Paciente } from './paciente.entity.js';
import { orm } from '../shared/db/orm.js';
import { hashPassword, comparePassword } from '../middlewares/authPass.js';
import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';
import { Turno } from '../turnos/turno.entity.js';

const em = orm.em;

dotenv.config();

const JWT_SECRET = process.env.JWT_SECRET as string;

function sanitizePacienteInput(
  req: Request,
  res: Response,
  next: NextFunction
) {
  req.body.sanitizedInput = {
    nombre: req.body.nombre,
    apellido: req.body.apellido,
    dni: req.body.dni,
    fechaNacimiento: req.body.fechaNacimiento,
    email: req.body.email,
    telefono: req.body.telefono,
    password: req.body.password,
    estado: req.body.estado,
    obraSocial: req.body.obraSocial,
  };

  Object.keys(req.body.sanitizedInput).forEach((key) => {
    if (req.body.sanitizedInput[key] === undefined) {
      delete req.body.sanitizedInput[key];
    }
  });

  next();
}

async function login(req: Request, res: Response) {
  const { email, password } = req.body;

  try {
    const paciente = await em.findOne(Paciente, { email });

    if (!paciente) {
      return res.status(401).json({ message: 'Usuario no encontrado' });
    }

    const isPasswordValid = await comparePassword(password, paciente.password);

    if (!isPasswordValid) {
      return res.status(401).json({ message: 'Contraseña incorrecta' });
    }

    const token = jwt.sign(
      { 
        id: paciente.id, 
        nombre: paciente.nombre, 
        apellido: paciente.apellido,
        role: 'P' // Role de paciente: 'P'
      },
      JWT_SECRET,
      {  
        expiresIn: '1h',
      }
    );

    // Establece el token en una cookie
    res.cookie('token', token, {
      httpOnly: true, // El token solo puede ser accedido desde el servidor
      secure: process.env.NODE_ENV === 'production', // Solo en HTTPS en producción
      sameSite: 'strict', // Previene que el token sea enviado en requests cross-site
      maxAge: 3600000, // 1 hora
    });

    res.status(200).json({
      message: 'Inicio de sesión exitoso',
      data: { email: paciente.email },
    });
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
}

async function obtenerTurnos(req: Request, res: Response) {
  const userId = req.user?.id;
  const nombre = req.user?.nombre;
  const apellido = req.user?.apellido;

  if (!userId) {
    return res.status(401).json({ message: 'Usuario no autenticado' });
  }

  try {
    // Encuentra los turnos del paciente autenticado
    const turnos = await em.find(
      Turno,
      { paciente: userId },
      { populate: ['kinesiologo'] }
    );

    // Formatea la respuesta para cumplir con el formato JSON deseado
    const turnosFormateados = turnos.map((turno) => ({
      id: turno.id,
      fecha: turno.fecha.toISOString(), // Asegura que la fecha esté en formato ISO
      hora: turno.hora, // Suponiendo que `hora` ya es una string en el formato deseado
      estado: turno.estado,
      importeTotal: turno.importeTotal,
      paciente: turno.paciente.id, // ID del paciente
      kinesiologo: {
        id: turno.kinesiologo.id,
        nombre: turno.kinesiologo.nombre,
        apellido: turno.kinesiologo.apellido,
      }, // ID del kinesiólogo
    }));

    res.status(200).json({
      userId,
      nombre,
      apellido,
      turnos: turnosFormateados,
    });
  } catch (error: any) {
    return res.status(500).json({
      message: 'Error al obtener los turnos',
      error: error.message,
    });
  }
}
async function logout(req: Request, res: Response) {
  res.clearCookie('token', {
    httpOnly: true,  // Me aseguro de que solo se pueda acceder desde el servidor
    secure: process.env.NODE_ENV === 'production',  //  HTTPS en producción
    sameSite: 'strict', 
  });
  res.status(200).json({ message: 'Cierre de sesión exitoso' });
}

async function findAll(req: Request, res: Response) {
  try {
    const pacientes = await em.find(Paciente, {});
    res
      .status(200)
      .json({ message: 'Todos los pacientes encontrados', data: pacientes });
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
}

async function findOne(req: Request, res: Response) {
  try {
    const id = Number.parseInt(req.params.id);
    const paciente = await em.findOneOrFail(Paciente, { id });
    res
      .status(200)
      .json({ message: 'Paciente encontrado exitosamente', data: paciente });
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
}

async function obtenerPaciente(req: Request, res: Response) {
  const userId = req.user?.id;

  if (!userId) {
    return res.status(401).json({ message: 'Usuario no autenticado' });
  }

  try {
    const paciente = await em.findOneOrFail(Paciente, { id: userId });
    res.status(200).json({ message: 'paciente encontrado', data: paciente });
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
}

// Función para capitalizar la primera letra de una cadena
function capitalizeFirstLetter(str: string) {
  return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
}

async function add(req: Request, res: Response) {
  try {
    const dni = Number(req.body.sanitizedInput.dni);

    // Verificar si el paciente ya existe
    const existingPaciente = await em.findOne(Paciente, { dni });
    if (existingPaciente) {
      return res.status(400).json({ message: 'El paciente ya existe' });
    }

    const hashedPassword = await hashPassword(req.body.sanitizedInput.password);

    // Capitalizar nombre y apellido
    const nombre = capitalizeFirstLetter(req.body.sanitizedInput.nombre);
    const apellido = capitalizeFirstLetter(req.body.sanitizedInput.apellido);
    const obraSocial = req.body.sanitizedInput.obraSocial.toUpperCase();

    const PacienteData = {
      ...req.body.sanitizedInput,
      dni,
      password: hashedPassword,
      obraSocial,
      nombre,
      apellido,
      estado: 'Activo',
    };

    const paciente = em.create(Paciente, PacienteData);
    await em.flush();

    // Generar token JWT
    const token = jwt.sign(
      { id: paciente.id, nombre: paciente.nombre, apellido: paciente.apellido },
      JWT_SECRET,
      { expiresIn: '1h' }
    );

    // Establecer el token en una cookie
    res.cookie('token', token, {
      httpOnly: true, // El token solo es accesible desde el servidor
      secure: process.env.NODE_ENV === 'production', // Solo en HTTPS en producción
      sameSite: 'strict', // Evita que el token sea enviado en requests cross-site
      maxAge: 3600000, // 1 hora
    });

    res.status(201).json({
      message: 'Paciente creado exitosamente',
      data: paciente,
    });
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
}

async function update(req: Request, res: Response) {
  try {
    const id = Number.parseInt(req.params.id);
    const pacienteToUpdate = await em.findOneOrFail(Paciente, { id });
    em.assign(pacienteToUpdate, req.body.sanitizedInput);
    await em.flush();
    res.status(200).json({
      message: 'Paciente modificado exitosamente',
      data: pacienteToUpdate,
    });
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
}

async function remove(req: Request, res: Response) {
  try {
    const id = Number.parseInt(req.params.id);
    const paciente = em.getReference(Paciente, id);
    await em.removeAndFlush(paciente);
    res.status(200).send({ message: 'Paciente borrado exitosamente' });
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
}
export {
  sanitizePacienteInput,
  findAll,
  findOne,
  add,
  update,
  remove,
  login,
  logout,
  obtenerTurnos,
  obtenerPaciente
};
