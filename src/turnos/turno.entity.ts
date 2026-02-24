import {
    Entity,
    ManyToOne,
    Property,
    Rel
  } from '@mikro-orm/core'
  import { BaseEntity } from '../shared/db/baseEntity.entity.js'
  import { Kinesiologo } from '../kinesiologo/kinesiologo.entity.js'
  import { Paciente } from '../paciente/paciente.entity.js'

@Entity()
export class Turno extends BaseEntity {
        @Property({nullable: false}) 
        fecha!:Date

        @Property({nullable: false}) 
        hora!:string

        @Property({nullable: false})
        estado!:string

        @Property({nullable: false}) 
        importeTotal!:number

        @ManyToOne(() => Paciente, {nullable: false})
        paciente !: Rel<Paciente>

        @ManyToOne(() => Kinesiologo, {nullable: false})
        kinesiologo !: Rel<Kinesiologo>   
        
    }

