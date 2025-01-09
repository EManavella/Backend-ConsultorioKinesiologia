import { Entity, Property, ManyToOne, Collection, Cascade, Rel } from "@mikro-orm/core";
import { BaseEntity } from "../shared/db/baseEntity.entity.js";
import { Consultorio } from "../consultorio/consultorio.entity.js";

@Entity()
export class Secretaria extends BaseEntity{
  @Property({ nullable:false })
  nombre !: string
  @Property({ nullable:false })
  apellido !: string
  @Property({ nullable:false })
  email !: string
  @Property({ nullable:false })
  password !: string
  @Property({ nullable:false })
  telefono !: string
  @Property({ nullable:false })
  dni  !: number
  @ManyToOne(() => Consultorio, {nullable: false })
  consultorio !: Rel<Consultorio>
}
