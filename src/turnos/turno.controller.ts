import { Request, Response, NextFunction } from "express"
import { Turno } from "./turno.entity.js"
import { orm } from '../shared/db/orm.js'
import { Precio } from "../precio/precio.entity.js"
import { parseISO, startOfDay } from 'date-fns';




const em = orm.em

function sanitizeTurnoInput(req: Request, res: Response, next: NextFunction){
   
    req.body.sanitizedInput = {
        fecha: req.body.fecha,
        hora: req.body.hora,
        estado: req.body.estado,
        importeTotal: req.body.importeTotal,
        paciente: req.body.paciente,
        kinesiologo: req.body.kinesiologo,
    };
    Object.keys(req.body.sanitizedInput).forEach((key)=>{
        if(req.body.sanitizedInput[key]===undefined){
            delete req.body.sanitizedInput[key]
        }
    });
    next();
}

async function findAll (req: Request,res: Response): Promise<void>  {
   try{
       const turnos = await em.find(Turno, {}, {populate: ['paciente', 'kinesiologo']})
       res.status(200).json({message: 'Todos los turnos encontrados', data: turnos})
   } catch (error: any){        
       res.status(500).json({message: error.message})
   }
}

async function findOne (req: Request,res: Response): Promise<void> {
    try{
        const id = Number.parseInt(req.params.id)
        const turno = await em.findOneOrFail(Turno, {id}, {populate: ['paciente', 'kinesiologo']})
        res.status(200).json({message: 'Turno encontardo con exito', data: turno})
    } catch (error: any){
        res.status(500).json({message: error.message})
    }
}

async function add (req: Request, res: Response): Promise<void>  {
    try{
        const {fecha, hora, kinesiologo} =  req.body.sanitizedInput;
        
        const existeTurno = await em.findOne(Turno, {fecha, hora, kinesiologo});
        if (existeTurno){
          res.status(400).json({message: 'Ya existe un turno para ese kinesiologo en ese horario'});
          return
        }    
         
        const turno = em.create(Turno, req.body.sanitizedInput);
        await em.flush();
        res.status(201).json({message: 'Turno creado exitosamente', data: turno});
    } catch (error: any){
        res.status(500).json({message: error.message});
    }
} 

async function update (req: Request, res: Response): Promise<void>  {
    try{
        const id = Number.parseInt(req.params.id)
        const turnoToUpdate = await em.findOneOrFail(Turno, {id});
        em.assign(turnoToUpdate, req.body.sanitizedInput)
        await em.flush()
        res.status(200).json({message: 'Turno modificado exitosamente', data: turnoToUpdate});
    } catch (error: any){
        res.status(500).json({message: error.message});
    }
}

async function remove(req: Request, res: Response): Promise<void>  {
    try{
        const id = Number.parseInt(req.params.id);
        const turno = em.getReference(Turno, id);
        await em.removeAndFlush(turno);
        res.status(200).send({message: 'Turno borrado exitosamente'});
    } catch (error: any){
        res.status(500).json({message: error.message});
    }
}


async function obtenerTurnosKine(req: Request, res: Response) {
    const userId = req.user?.id;

    if (!userId) {
      return res.status(401).json({ message: 'Usuario no autenticado' });
    }
  
    try {
        const ahora = new Date(); // Fecha y hora actual
        
      // Encuentra los turnos pendientes
      const turnos = await em.find(
        Turno,
        { kinesiologo: Number(req.params.kineId), estado:"Activo",fecha: { $gt: ahora }, },
        { populate: ['paciente'] }
      );
  
      // Formatea la respuesta para cumplir con el formato JSON deseado
      const turnosFormateados = turnos.map((turno) => ({
        id: turno.id,
        fecha: turno.fecha.toISOString(), // Asegura que la fecha esté en formato ISO
        hora: turno.hora, // Suponiendo que `hora` ya es una string en el formato deseado
        estado: turno.estado,
        importeTotal: turno.importeTotal,
        kinesiologo: turno.kinesiologo.id,
        paciente: {
          id: turno.paciente.id,
          nombre: turno.paciente.nombre,
          apellido: turno.paciente.apellido,
        },
      }));
  
      res.status(200).json({
        turnos: turnosFormateados,
      });
    } catch (error: any) {
      return res.status(500).json({
        message: 'Error al obtener los turnos',
        error: error.message,
      });
    }
  }

async function creacionTurno(req:Request, res:Response){
    try{
        const especialidad=Number.parseInt(req.body.especialidadId)
        const precio = await em.findOne(Precio, {especialidad, fechaDesde:{$lte: new Date()} }, {populate: ['especialidad'], orderBy: { fechaDesde: 'DESC' }});
        if (!precio) {
            return res.status(400).json({ error: 'Precio no encontrado para la especialidad' });
        }

        const fecha = startOfDay(parseISO(req.body.fecha));
        const hora = req.body.hora
        const kinesiologo = Number.parseInt(req.body.kinesiologoId)

        // Verificar si ya existe un turno para el kinesiólogo en ese horario
        const existeTurno = await em.findOne(Turno, { fecha, hora, kinesiologo: kinesiologo });
        if (existeTurno) {
            res.status(400).json({ message: 'Ya existe un turno para el kinesiologo en ese horario' });
            return;
        }

        const turno = em.create(Turno, {
            paciente: req.user?.id,
            kinesiologo,
            fecha,
            hora,
            estado: 'Activo', 
            importeTotal: precio.importe,
          });

        // Guardar el turno en la base de datos
        await em.flush();
        return res.json({ message: 'Turno registrado exitosamente', turno });

    }catch (error: any) {
        res.status(500).json({ message: error.message });
    }
}

export {sanitizeTurnoInput, findAll, findOne, add, update, remove, creacionTurno, obtenerTurnosKine}; 