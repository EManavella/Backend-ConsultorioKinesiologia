import { Entity, Property, ManyToOne, Collection, Cascade, Rel, OneToMany } from "@mikro-orm/core";
import { BaseEntity } from "../shared/db/baseEntity.entity.js";
import { Especialidad } from "../especialidad/especialidad.entity.js";
import { Consultorio } from '../consultorio/consultorio.entity.js';
import { Turno } from "../turnos/turno.entity.js";
import { Disponibilidad } from "../disponibilidad/dispo.enitity.js";


@Entity()
export class Kinesiologo extends BaseEntity{
  @Property({ nullable: false, unique: true })
  matricula!: string
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
  @ManyToOne(()=> Especialidad, {nullable:false})
  especialidad !:Rel<Especialidad>
  @ManyToOne(() => Consultorio, {nullable: false })
  consultorio !: Rel<Consultorio>
  @OneToMany(() => Turno, turno => turno.kinesiologo, {cascade: [Cascade.ALL]})
  turnos = new Collection<Turno>(this);
  @OneToMany(() => Disponibilidad, disponibilidad => disponibilidad.kinesiologo, {cascade: [Cascade.ALL]})
  disponibilidad = new Collection<Disponibilidad>(this);
}