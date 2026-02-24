import { Request, Response} from 'express'
import { validationResult } from 'express-validator'
import { orm } from '../shared/db/orm.js'
import { Consultorio } from './consultorio.entity.js'

const em = orm.em

async function findAll(req: Request, res: Response) {
  try{
    const consultorio = await em.find( Consultorio, {} )
    res.status(200).json( {message: 'Todos los consultorios encontrados', data: consultorio})
  } catch (error: any) {
    res.status(500).json({ message: error.message })
  }
}

async function findOne(req: Request, res: Response) {
  try {
    const id = Number.parseInt(req.params.id)
    const consultorio = await em.findOneOrFail(Consultorio, { id })
    res.status(200).json({ message: 'Consultorio encontrado exitosamente', data: consultorio })
  } catch (error: any) {
    res.status(500).json({ message: error.message })
  }
}

async function add(req: Request, res: Response) {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }
  try{
    const consultorio = em.create(Consultorio, req.body)
    await em.flush()
    res.status(201).json({ message: 'Consultorio creado exitosamente', data: consultorio })
  } catch (error: any) {
    res.status(500).json({ message: error.message })
  }
}

async function update(req: Request, res: Response) {
  try {
    const id = Number.parseInt(req.params.id)
    const consultorio = em.getReference(Consultorio, id)
    em.assign(consultorio, req.body)
    await em.flush()
    res.status(200).json({ message: 'Consultorio modificado exitosamente' })
  } catch (error: any) {
    res.status(500).json({ message: error.message })
  }
}

async function remove(req: Request, res: Response) {
  try {
    const id = Number.parseInt(req.params.id)
    const consultorio = em.getReference(Consultorio, id)
    await em.removeAndFlush(consultorio)
    res.status(200).send({ message: 'Consultorio borrado exitosamente' })
  } catch (error: any) {
    res.status(500).json({ message: error.message })
  } 
}

export { findAll, findOne, add, update, remove }