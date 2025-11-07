import { Column, Entity, JoinColumn, ManyToOne, OneToOne, PrimaryGeneratedColumn } from "typeorm";
import { Sorteo } from "../../sorteos/entities/sorteo.entity";
import { Client } from "../../users/entities/client.entity";
import { Pago } from "../../pagos/entities/pago.entity";

@Entity('boletos')
export class Boleto {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column()
    number: string;

    @Column({ type: 'float' })
    price: number;

    @Column({ default: false })
    isReserved: boolean;

    @ManyToOne(() => Sorteo, (sorteo) => sorteo.boletos)
    @JoinColumn({ name: 'sorteo_id' })
    sorteo: Sorteo;

    @ManyToOne(() => Client, (client) => client.boletos, { nullable: true })
    @JoinColumn({ name: 'client_id' })
    client: Client;

    @OneToOne(() => Pago, (pago) => pago.boleto, { nullable: true, cascade: true })
    pago: Pago;
}