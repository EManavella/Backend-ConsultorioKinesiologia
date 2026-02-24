import { Request, Response, NextFunction } from 'express';
import { Disponibilidad } from './dispo.enitity.js';
import { orm } from '../shared/db/orm.js';
import { Kinesiologo } from '../kinesiologo/kinesiologo.entity.js';
import { Turno } from '../turnos/turno.entity.js';
import { parseISO, startOfDay, format, isAfter } from 'date-fns';

const em = orm.em;

function sanitizedInput(req: Request, res: Response, next: NextFunction) {
  req.body.sanitizedInput = {
    fechaDesde: req.body.fechaDesde,
    diaSemana: req.body.diaSemana,
    horaInicio: req.body.horaInicio,
    horaFin: req.body.horaFin,
    kinesiologo: req.body.kinesiologo,
  };
  Object.keys(req.body.sanitizedInput).forEach((key) => {
    if (req.body.sanitizedInput[key] === undefined) {
      delete req.body.sanitizedInput[key];
    }
  });
  next();
}

async function findAll(req: Request, res: Response) {
  try {
    const disponibilidad = await em.find(
      Disponibilidad,
      {},
      { populate: ['kinesiologo'] }
    );
    res.status(200).json({
      message: 'Todas las disponibilidades fueron encontradas',
      data: disponibilidad,
    });
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
}

async function findOne(req: Request, res: Response) {
  try {
    const id = Number.parseInt(req.params.id);
    const disponibilidad = await em.findOneOrFail(
      Disponibilidad,
      { id },
      { populate: ['kinesiologo'] }
    );
    res.status(200).json({
      message: 'Disponibilidad encontrada con exito',
      data: disponibilidad,
    });
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
}

async function add(req: Request, res: Response) {
  try {
    const {
      diaSemana,
      horaInicio,
      horaFin,
      kinesiologo: kinesiologoId,
    } = req.body.sanitizedInput;

    // Verifica que el kinesiólogo exista
    const kinesiologo = await em.findOne(Kinesiologo, { id: kinesiologoId });
    if (!kinesiologo) {
      return res.status(404).json({ message: 'Kinesiólogo no encontrado' });
    }

    // Crea el registro de disponibilidad
    const disponibilidad = em.create(Disponibilidad, {
      fechaDesde: new Date(), // or any appropriate date value
      diaSemana,
      horaInicio,
      horaFin,
      kinesiologo,
    });

    await em.persistAndFlush(disponibilidad);
    res.status(201).json({
      message: 'Disponibilidad creada exitosamente',
      data: disponibilidad,
    });
  } catch (error: any) {
    console.error('Error al crear disponibilidad:', error);
    res.status(500).json({ message: 'Error interno del servidor' });
  }
}

async function update(req: Request, res: Response) {
  try {
    const id = Number.parseInt(req.params.id);
    const disponibilidadToUpdate = await em.findOneOrFail(Disponibilidad, {
      id,
    });
    em.assign(disponibilidadToUpdate, req.body.sanitizedInput);
    await em.flush();
    res.status(200).json({ message: 'Disponibilidad modificada exitosamente' });
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
}

async function remove(req: Request, res: Response) {
  try {
    const id = Number.parseInt(req.params.id);
    const disponibilidad = em.getReference(Disponibilidad, id);
    await em.removeAndFlush(disponibilidad);
    res.status(200).send({ message: 'Disponibilidad borrada exitosamente' });
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
}

async function checkDisponibilidad(req: Request, res: Response) {
  try {
    const kinesiologoId = Number(req.params.kinesiologoId);
    const fecha = startOfDay(parseISO(req.params.fecha)); // Convierte la fecha a las 00:00 en UTC
    const diaSemana = fecha
      .toLocaleDateString('es-ES', { weekday: 'long' })
      .toLowerCase();
    if (!fecha || !kinesiologoId) {
      return res
        .status(400)
        .json({ error: 'Debe proporcionar fecha y kinesiologoId' });
    }

    // Obtener las disponibilidades del kinesiólogo para el día seleccionado
    const disponibilidades = await em.find(Disponibilidad, {
      kinesiologo: kinesiologoId,
      diaSemana: diaSemana,
      fechaDesde: { $lte: fecha },
    });

    if (disponibilidades.length === 0) {
      return res.json({
        message: 'No hay disponibilidad para la fecha seleccionada',
        horariosDisponibles: [],
      });
    }

    // Obtener los turnos ya registrados para el kinesiólogo en la fecha seleccionada
    const turnosRegistrados = await em.find(Turno, {
      kinesiologo: kinesiologoId,
      fecha: fecha,
    });

    // Crear un array con los horarios ocupados para búsqueda eficiente
    const horariosOcupados = turnosRegistrados.map((turno) => turno.hora);

    // Generar los horarios disponibles
    const horariosDisponibles = disponibilidades
      .flatMap((disponibilidad) => {
        const horaInicio = parseInt(disponibilidad.horaInicio.split(':')[0]);
        const horaFin = parseInt(disponibilidad.horaFin.split(':')[0]);

        // Crear un array de horarios posibles para cada disponibilidad
        const horarios = [];
        for (let hora = horaInicio; hora < horaFin; hora++) {
          const horario = `${hora.toString().padStart(2, '0')}:00`;
          horarios.push(horario);
        }

        return horarios;
      })
      .filter((horario) => !horariosOcupados.includes(horario));

    if (horariosDisponibles.length === 0) {
      return res.json({
        message: 'No hay horarios disponibles para la fecha seleccionada',
        horariosDisponibles: [],
      });
    }

    return res.json({
      horariosDisponibles: horariosDisponibles.sort(), // Ordenar los horarios disponibles
      intervalos: disponibilidades.map((d) => ({
        diaSemana: d.diaSemana,
        horaInicio: d.horaInicio,
        horaFin: d.horaFin,
      })),
    });
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
}

async function findPorKine(req: Request, res: Response) {
  const kinesiologoId = parseInt(req.params.kineId);

  try {
    const kinesiologo = await em.findOne(Kinesiologo, { id: kinesiologoId });
    if (!kinesiologo) {
      return res.status(404).json({ message: 'Kinesiologo no encontrado' });
    }
    const disponibilidades = await em.find(Disponibilidad, {
      kinesiologo: { id: kinesiologoId },
    });

    if (disponibilidades.length === 0) {
      return res.status(404).json({
        message: 'No se encontraron disponibilidades para este kinesiologo',
      });
    }

    res.status(200).json({
      message: 'Disponibilidades encontradas',
      data: disponibilidades,
    });
  } catch (error: any) {
    return res.status(500).json({
      message: 'Error al obtener las disponibilidades',
      error: error.message,
    });
  }
}

export {
  sanitizedInput,
  findPorKine,
  findAll,
  findOne,
  add,
  update,
  remove,
  checkDisponibilidad,
};
