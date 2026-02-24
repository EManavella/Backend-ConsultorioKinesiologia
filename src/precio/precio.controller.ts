import { Request, Response, NextFunction} from 'express'
import { orm } from '../shared/db/orm.js'
import { Precio } from './precio.entity.js'

const em = orm.em

function sanitizePrecioInput(req: Request, res: Response, next: NextFunction) {
  req.body.sanitizedInput = {
        fechaDesde: req.body.fechaDesde,
        especialidad: req.body.especialidad,
  }
  

  Object.keys(req.body.sanitizedInput).forEach((key) => {
    if (req.body.sanitizedInput[key] === undefined) {
      delete req.body.sanitizedInput[key]
    }
  })
  next()
}
// TIPOSSSS EN VEZ DE TIPO
async function findAll(req: Request, res: Response) {
  try{
    const precio = await em.find( Precio, {}, {populate: ['especialidad' ] } )
    res.status(200).json( {message: 'Todos los precios fueron encontrados', data: precio})
  } catch (error: any) {
    res.status(500).json({ message: error.message })
  }
}

async function findOne(req: Request, res: Response) {
  try {
    const id = Number.parseInt(req.params.id)
    const precio = await em.findOneOrFail(Precio, { id }, {populate: ['especialidad']})
    res.status(200).json({ message: 'Precio encontrado exitosamente', data: precio })
  } catch (error: any) {
    res.status(500).json({ message: error.message })
  }
}

async function add(req: Request, res: Response) {
  try{
    const precio = em.create(Precio, req.body)
    await em.flush()
    res.status(201).json({ message: 'Precio creado exitosamente', data: precio })
  } catch (error: any) {
    res.status(500).json({ message: error.message })
  }
}

async function update(req: Request, res: Response) {
  try {
    const id = Number.parseInt(req.params.id)
    const precio = em.getReference(Precio, id)
    em.assign(precio, req.body)
    await em.flush()
    res.status(200).json({ message: 'Precio modificado exitosamente' })
  } catch (error: any) {
    res.status(500).json({ message: error.message })
  }
}

async function remove(req: Request, res: Response) {
  try {
    const id = Number.parseInt(req.params.id)
    const precio = em.getReference(Precio, id)
    await em.removeAndFlush(precio)
    res.status(200).send({ message: 'Precio borrado exitosamente' })
  } catch (error: any) {
    res.status(500).json({ message: error.message })
  } 
}

export { sanitizePrecioInput, findAll, findOne, add, update, remove }