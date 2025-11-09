import { Column, Entity, JoinColumn, OneToOne, PrimaryGeneratedColumn } from "typeorm";
import { Pago } from "./pago.entity";

@Entity('comprobantes')
export class Comprobante {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column()
    imageUrl: string;

    @OneToOne(() => Pago, (pago) => pago.comprobante)
    @JoinColumn({ name: 'pago_id' })
    pago: Pago;
}