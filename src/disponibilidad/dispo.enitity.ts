import { Entity, Property, ManyToOne, Rel } from '@mikro-orm/core';
import { BaseEntity } from '../shared/db/baseEntity.entity.js';
import { Kinesiologo } from '../kinesiologo/kinesiologo.entity.js';

@Entity()
export class Disponibilidad extends BaseEntity {
  @Property({ nullable: false })
  fechaDesde!: Date;

  @Property({ nullable: false })
  diaSemana!: string;

  @Property({ nullable: false })
  horaInicio!: string;

  @Property({ nullable: false })
  horaFin!: string;

  @ManyToOne(() => Kinesiologo, { nullable: false })
  kinesiologo!: Rel<Kinesiologo>;
}
