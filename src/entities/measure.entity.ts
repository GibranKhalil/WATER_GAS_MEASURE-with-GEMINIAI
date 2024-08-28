import { MeasureType } from './../@types/measure.types';
import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity({ name: 'measures' })
export class MeasureEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'customer_code', type: 'text', nullable: false })
  customer_code: string;

  @Column({ name: 'image', type: 'text', nullable: false })
  image: string;

  @Column({
    name: 'measure_datetime',
    type: 'timestamp',
    length: 100,
    nullable: false,
  })
  measure_datetime: Date;

  @Column({
    name: 'measure_type',
    type: 'enum',
    enum: MeasureType,
    length: 11,
    nullable: false,
  })
  measure_type: MeasureType;

  @Column({
    name: 'has_confirmed',
    type: 'boolean',
    default: false,
    nullable: false,
  })
  has_confirmed: boolean;
}
