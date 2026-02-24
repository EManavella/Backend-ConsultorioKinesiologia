import { Entity, Property,  Collection, Cascade, Rel, OneToMany } from "@mikro-orm/core";
import { BaseEntity } from "../shared/db/baseEntity.entity.js";
import { Turno } from "../turnos/turno.entity.js";

@Entity()
export class Paciente extends BaseEntity {
    @Property({ nullable: false })
     nombre!:string

    @Property({ nullable: false })
     apellido!:string

    @Property({ nullable: false })
     dni!:number

    @Property({ nullable: false })
     fechaNacimiento!:Date

    @Property({ nullable: false })
     email!:string

    @Property({ nullable: false })
     telefono!: string

     @Property({ nullable: false })
     password!: string

     @Property({ nullable: false })
     estado!: string

    @Property({ nullable: false })
     obraSocial!: string

    @OneToMany(() => Turno, (turno) => turno.paciente, {
        cascade: [Cascade.ALL],
    })
    Turnos = new Collection<Turno>(this)
}
