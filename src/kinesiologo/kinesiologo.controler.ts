import { Request, Response, NextFunction } from 'express';
import { Kinesiologo } from './kinesiologo.entity.js';
import { orm } from '../shared/db/orm.js';
import { comparePassword, hashPassword } from '../middlewares/authPass.js';
import { Especialidad } from '../especialidad/especialidad.entity.js';
import { Consultorio } from '../consultorio/consultorio.entity.js';
import { Turno } from '../turnos/turno.entity.js';
import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';

const em = orm.em;

dotenv.config();

const JWT_SECRET = process.env.JWT_SECRET as string;

function sanitizeKinesiologoInput(
  req: Request,
  res: Response,
  next: NextFunction
) {
  req.body.sanitizedInput = {
    nombre: req.body.nombre,
    apellido: req.body.apellido,
    dni: req.body.dni,
    matricula: req.body.matricula,
    email: req.body.email,
    telefono: req.body.telefono,
    password: req.body.password,
    especialidad: req.body.especialidad,
    consultorio: req.body.consultorio,
  };

  Object.keys(req.body.sanitizedInput).forEach((key) => {
    if (req.body.sanitizedInput[key] === undefined) {
      delete req.body.sanitizedInput[key];
    }
  });
  next();
}

async function login(req: Request, res: Response) {
  const { matricula, password } = req.body;

  try {
    const kinesiologo = await em.findOne(Kinesiologo, { matricula });

    if (!kinesiologo) {
      return res.status(401).json({ message: 'Usuario no encontrado' });
    }

    const isPasswordValid = await comparePassword(
      password,
      kinesiologo.password
    );

    if (!isPasswordValid) {
      return res.status(401).json({ message: 'Contraseña incorrecta' });
    }

    const token = jwt.sign(
      {
        id: kinesiologo.id,
        nombre: kinesiologo.nombre,
        apellido: kinesiologo.apellido,
      },
      JWT_SECRET,
      {
        expiresIn: '1h',
      }
    );

    // Establece el token en una cookie segura
    res.cookie('token', token, {
      httpOnly: true, // El token solo puede ser accedido desde el servidor
      secure: process.env.NODE_ENV === 'production', // Solo en HTTPS en producción
      sameSite: 'strict', // Previene que el token sea enviado en requests cross-site
      maxAge: 3600000, // 1 hora
    });

    res.status(200).json({
      message: 'Inicio de sesión exitoso',
      data: { matricula: kinesiologo.matricula },
    });
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
}

async function obtenerTurnosKinesiologo(req: Request, res: Response) {
  const userId = req.user?.id;
  const nombre = req.user?.nombre;
  const apellido = req.user?.apellido;

  if (!userId) {
    return res.status(401).json({ message: 'Kinesiologo no autenticado' });
  }

  try {
    // Encuentra los turnos del kinesiologo autenticado
    const turnos = await em.find(
      Turno,
      { kinesiologo: userId },
      { populate: ['paciente'] }
    );

    // Formatea la respuesta para cumplir con el formato JSON deseado
    const turnosFormateados = turnos.map((turno) => ({
      id: turno.id,
      fecha: turno.fecha.toISOString(), // Asegura que la fecha esté en formato ISO
      hora: turno.hora, // Suponiendo que `hora` ya es una string en el formato deseado
      estado: turno.estado,
      importeTotal: turno.importeTotal,
      kinesiologo: turno.kinesiologo.id, // ID del paciente
      paciente: {
        id: turno.paciente.id,
        nombre: turno.paciente.nombre,
        apellido: turno.paciente.apellido,
      }, // ID del kinesiólogo
    }));

    res.status(200).json({
      userId,
      nombre,
      apellido,
      turnos: turnosFormateados, // Incluye los turnos formateados en la respuesta
    });
  } catch (error: any) {
    return res.status(500).json({
      message: 'Error al obtener los turnos',
      error: error.message,
    });
  }
}

async function logout(req: Request, res: Response) {
  res.clearCookie('token');
  res.status(200).json({ message: 'Cierre de sesión exitoso' });
}

async function findAll(req: Request, res: Response) {
  try {
    const kinesiologos = await em.find(
      Kinesiologo,
      {},
      { populate: ['consultorio', 'especialidad'] }
    );
    res.status(200).json({
      message: 'Todos los kinesiologos encontrados',
      data: kinesiologos,
    });
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
}

async function findOne(req: Request, res: Response) {
  try {
    const id = Number.parseInt(req.params.id);
    const kinesiologos = await em.findOneOrFail(
      Kinesiologo,
      { id },
      { populate: ['consultorio', 'especialidad'] }
    );
    res.status(200).json({
      message: 'Kinesiologo encontrado con exito',
      data: kinesiologos,
    });
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
}

async function obtenerKinesiologo(req: Request, res: Response) {
  const userId = req.user?.id;
/*  const Nombre = req.user?.nombre;
  const Apellido = req.user?.apellido;
  const Dni = req.user?.dni;
  const Email = req.user?.email;
  const Telefono = req.user?.telefono;
  const Matricula = req.user?.matricula;
  */

  if (!userId) {
    return res.status(401).json({ message: 'Usuario no autenticado' });
  }

  try {
    const kinesiologo = await em.findOneOrFail(Kinesiologo, { id: userId },{ populate: ['consultorio', 'especialidad'] });
    res.status(200).json({ message: 'Kinesiologo encontrado', data: kinesiologo });
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
}

async function add(req: Request, res: Response) {
  try {
    // Verificar si el Kinesiologo ya existe
    const existingKinesiologo = await em.findOne(Kinesiologo, {
      dni: req.body.sanitizedInput.dni,
    });

    if (existingKinesiologo) {
      return res.status(400).json({ message: 'El Kinesiologo ya existe' });
    }

    // Buscar el ID de la especialidad
    const especialidad = await em.findOne(Especialidad, {
      id: req.body.especialidad,
    });
    if (!especialidad) {
      return res.status(400).json({ message: 'Especialidad no encontrada' });
    }


    // Obtener el consultorio ID desde el token
    const consultorio = await em.findOne(Consultorio, {
      id: req.body.consultorio,
    });

    if (!consultorio) {
      return res.status(400).json({ message: 'Consultorio no encontrado' });
    }

    // Hash de la contraseña
    const hashedPassword = await hashPassword(req.body.sanitizedInput.password);

    // Preparar los datos del kinesiologo, incluyendo el consultorio asignado automáticamente
    const kinesiologoData = {
      ...req.body.sanitizedInput,
      consultorio: consultorio.id, // Asignar el consultorio del token
      especialidad: especialidad.id,
      password: hashedPassword,
    };
    
    const kinesiologo = em.create(Kinesiologo, kinesiologoData);
    await em.flush();
    res
      .status(201)
      .json({ message: 'Kinesiologo creado exitosamente', data: kinesiologo });
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
}

async function update(req: Request, res: Response) {
  try {
    const id = Number.parseInt(req.params.id);
    const kinesiologoToUpdate = await em.findOneOrFail(Kinesiologo, { id });
    em.assign(kinesiologoToUpdate, req.body.sanitizedInput);
    await em.flush();
    res.status(200).json({
      message: 'Kinesiologo modificado exitosamente',
      data: kinesiologoToUpdate,
    });
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
}

async function remove(req: Request, res: Response) {
  try {
    const id = Number.parseInt(req.params.id);
    const kinesiologo = await em.findOneOrFail(Kinesiologo, id, {
      populate: ['turnos'],
    });

    // Verificar que si el kinesiologo tiene turnos activos no poder eliminarlo
    const turnosActivos = kinesiologo.turnos
      .getItems()
      .some((turno) => turno.estado === 'activo');

    if (turnosActivos) {
      return res.status(400).json({
        message:
          'No se puede dar de baja al kinesiologo porque tiene turnos activos.',
      });
    }
    await em.removeAndFlush(kinesiologo);
    res.status(200).json({ message: 'Kinesiologo eliminado con éxito' });
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
}

async function findKineByEspCon(req: Request, res: Response) {
  const userId = req.user?.id;
  const consultorio = req.user?.consultorio;
  const especialidad = Number(req.params.especialidadId);

  if (!userId) {
    return res.status(401).json({ message: 'Usuario no autenticado' });
  }

  try {
    // Encuentra los turnos del paciente autenticado
    const kinesiologos = await em.find(
      Kinesiologo,
      { consultorio, especialidad },
      { populate: ['consultorio', 'especialidad'] }
    );

    if (!especialidad || !consultorio) {
      return res
        .status(404)
        .json({ message: 'Especialidad o consultorio no encontrado' });
    }

    res
      .status(200)
      .json({ message: 'Kinesiólogos encontrados', data: kinesiologos });
  } catch (error: any) {
    return res.status(500).json({
      message: 'Error al obtener los kinesiologos',
      error: error.message,
    });
  }
}

async function findPorConsul(req: Request, res: Response) {
  const consultorio = req.user?.consultorio;

  if (!consultorio) {
    return res.status(401).json({
      message: 'Usuario no autenticado o consultorio no especificado',
    });
  }

  try {
    const kinesiologos = await em.find(
      Kinesiologo,
      { consultorio },
      { populate: ['consultorio', 'especialidad'] }
    );

    if (!kinesiologos.length) {
      return res
        .status(404)
        .json({ message: 'No se encontraron kinesiologos en el consultorio' });
    }

    res.status(200).json({
      message: 'Kinesiologos encontrados',
      data: kinesiologos,
    });
  } catch (error: any) {
    return res.status(500).json({
      message: 'Error al obtener los kinesiologos',
      error: error.message,
    });
  }
}

export {
  sanitizeKinesiologoInput,
  findAll,
  findOne,
  obtenerKinesiologo,
  add,
  update,
  remove,
  login,
  logout,
  obtenerTurnosKinesiologo,
  findKineByEspCon,
  findPorConsul,
};
