import { Organizador } from "../../users/entities/organizador.entity";
import { Column, CreateDateColumn, Entity, JoinColumn, ManyToOne, OneToMany, PrimaryGeneratedColumn, UpdateDateColumn } from "typeorm";
import { Premio } from "./premio.entity";
import { Boleto } from "../../boletos/entities/boleto.entity";

@Entity('sorteos')
export class Sorteo {

    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column()
    title: string;

    @Column({ type: 'float' })
    ticketPrice: number;

    @Column({ type: 'int' })
    numbersQuantity: number;

    @Column({ type: 'int' })
    startNumber: number;

    @Column()
    imageUrl: string;

    @Column({ type: 'text' })
    description: string;

    @Column({ type: 'date' })
    paymentDeadline: Date;

    @Column({ type: 'date' })
    saleStartDate: Date;

    @Column({ type: 'date' })
    saleEndDate: Date;

    @Column({ type: 'timestamp' })
    raffleDateTime: Date;

    @ManyToOne(() => Organizador, (organizador) => organizador.sorteos)
    @JoinColumn({ name: 'organizador_id' })
    organizador: Organizador;

    @OneToMany(() => Premio, (premio) => premio.sorteo, { cascade: true })
    premios: Premio[];

    @OneToMany(() => Boleto, (boleto) => boleto.sorteo, { cascade: true })
    boletos: Boleto[];

    @Column({ type: 'uuid', nullable: true, name: 'winning_ticket_id' })
    winningTicketId: string;

    @CreateDateColumn({ name: 'created_at', type: 'timestamp' })
    createdAt: Date;

    @UpdateDateColumn({ name: 'updated_at', type: 'timestamp' })
    updatedAt: Date;
}
