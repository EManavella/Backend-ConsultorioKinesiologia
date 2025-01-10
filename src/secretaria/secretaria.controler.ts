import { Request, Response, NextFunction } from 'express';
import { Secretaria } from './secretaria.entity.js';
import { orm } from '../shared/db/orm.js';
import { comparePassword, hashPassword } from '../middlewares/authPass.js';
import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';

const em = orm.em;

dotenv.config();

const JWT_SECRET = process.env.JWT_SECRET as string;

function sanitizeSecretariaInput(
  req: Request,
  res: Response,
  next: NextFunction
) {
  req.body.sanitizedInput = {
    nombre: req.body.nombre,
    apellido: req.body.apellido,
    email: req.body.email,
    password: req.body.password,
    telefono: req.body.telefono,
    dni: req.body.dni,
    consultorio: req.body.consultorio,
  };
  //more checks here

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
    const secretaria = await em.findOne(Secretaria, { email });

    if (!secretaria) {
      return res.status(401).json({ message: 'Usuario no encontrado' });
    }

    const isPasswordValid = await comparePassword(
      password,
      secretaria.password
    );

    if (!isPasswordValid) {
      return res.status(401).json({ message: 'Contraseña incorrecta' });
    }

    const token = jwt.sign(
      {
        id: secretaria.id,
        nombre: secretaria.nombre,
        apellido: secretaria.apellido,
        consultorio: secretaria.consultorio,
        role: 'S' //role de secretaria: 'S'
      },
      JWT_SECRET,
      {
        expiresIn: '1h',
      }
    );

    res.cookie('token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 3600000,
    });

    res
      .status(200)
      .json({
        message: 'Sesión iniciada exitosamente',
        data: { email: secretaria.email },
      });
  } catch (error: any) {
    res.status(500).json({ message: error.message });
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
    const secretarias = await em.find(
      Secretaria,
      {},
      { populate: ['consultorio'] }
    );
    res.status(200).json({
      message: 'Todas las secretarias encontradas',
      data: secretarias,
    });
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
}

async function findOne(req: Request, res: Response) {
  try {
    const id = Number.parseInt(req.params.id);
    const secretaria = await em.findOneOrFail(
      Secretaria,
      { id },
      { populate: ['consultorio'] }
    );
    res
      .status(200)
      .json({ message: 'Secretaria encontrada con exito', data: secretaria });
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
}

async function obtenerSecretaria(req: Request, res: Response) {
  const userId = req.user?.id;


  if (!userId) {
    return res.status(401).json({ message: 'Usuario no autenticado' });
  }

  try {
    const secretaria = await em.findOneOrFail(Secretaria, { id: userId },{ populate: ['consultorio'] });
    res.status(200).json({ message: 'Secretaria encontrada', data: secretaria });
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
}

async function consultorioDeSecretariaLogueada(req: Request, res: Response) {
  const userId = req.user?.id;

  if (!userId) {
    return res.status(401).json({ message: 'Usuario no autenticado' });
  }

  try {
    const secretaria = await em.findOneOrFail(Secretaria, { id: userId }, { populate: ['consultorio'] });
    res.status(200).json({ message: 'Consultorio obtenido', consultorio: secretaria.consultorio });
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
}

async function add(req: Request, res: Response) {
  try {
    // Verificar si el Secretaria ya existe
    const existingSecretaria = await em.findOne(Secretaria, {
      dni: req.body.sanitizedInput.dni,
    });

    if (existingSecretaria) {
      return res.status(400).json({ message: 'La Secretaria ya existe' });
    }

    const hashedPassword = await hashPassword(req.body.sanitizedInput.password);
    // Asigno a la constante data el hash de la paswword
    const secretarialogoData = {
      ...req.body.sanitizedInput,
      password: hashedPassword,
    };

    // Creo secretaria pasandole como parametro la constante secretarialogoData
    const secretaria = em.create(Secretaria, secretarialogoData);
    await em.flush();
    res
      .status(201)
      .json({ message: 'Secretaria creada exitosamente', data: secretaria });
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
}

async function update(req: Request, res: Response) {
  try {
    const id = Number.parseInt(req.params.id);
    const secretariaToUpdate = await em.findOneOrFail(Secretaria, { id });
    em.assign(secretariaToUpdate, req.body.sanitizedInput);
    await em.flush();
    res.status(200).json({
      message: 'Secretaria modificada exitosamente',
      data: secretariaToUpdate,
    });
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
}

async function remove(req: Request, res: Response) {
  try {
    const id = Number.parseInt(req.params.id);
    const secretaria = em.getReference(Secretaria, id);
    await em.removeAndFlush(secretaria);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
}

export {
  sanitizeSecretariaInput,
  findAll,
  findOne,
  obtenerSecretaria,
  consultorioDeSecretariaLogueada,
  add,
  update,
  remove,
  login,
  logout,
};
