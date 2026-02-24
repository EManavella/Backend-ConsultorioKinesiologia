import { Entity, Property, OneToMany,  Cascade,  Collection, ManyToOne, Rel } from "@mikro-orm/core";
import { BaseEntity } from "../shared/db/baseEntity.entity.js";
import { Especialidad } from "../especialidad/especialidad.entity.js";

@Entity()
export class Precio extends BaseEntity{
  @Property({ nullable:false })
  fechaDesde !: Date
  @Property({ nullable:false })
  importe !: number
  @ManyToOne(() => Especialidad, {nullable: false })
  especialidad !: Rel<Especialidad>
}
