import { Column, Entity, OneToOne, PrimaryGeneratedColumn, JoinColumn } from 'typeorm';
import { Sorteo } from '../../sorteos/entities/sorteo.entity';

@Entity('recordatorio_config')
export class RecordatorioConfig {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'int', default: 3 })
  frequencyDays: number;

  @Column({ type: 'varchar', length: 5, default: '09:00' })
  sendTime: string;

  @Column({ type: 'varchar', length: 255 })
  subject: string;

  @Column({ type: 'text' })
  body: string;

  @OneToOne(() => Sorteo, (sorteo) => sorteo.recordatorioConfig)
  @JoinColumn()
  sorteo: Sorteo;
}
