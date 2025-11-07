import { Column, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn } from "typeorm";
import { Sorteo } from "./sorteo.entity";

@Entity('premios')
export class Premio {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column()
    name: string;

    @Column({ type: 'int' })
    place: number;

    @Column()
    imageUrl: string;

    @Column({ type: 'text' })
    description: string;

    @Column({ type: 'int', nullable: true })
    winningNumber: number;

    @ManyToOne(() => Sorteo, (sorteo) => sorteo.premios)
    @JoinColumn({ name: 'sorteo_id' })
    sorteo: Sorteo;
}