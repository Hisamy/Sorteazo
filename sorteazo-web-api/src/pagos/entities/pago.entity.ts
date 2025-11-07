import { Column, CreateDateColumn, Entity, JoinColumn, OneToOne, PrimaryGeneratedColumn } from "typeorm";
import { TipoPago, EstadoPago } from "../enums/pagos.enum";
import { Boleto } from "src/boletos/entities/boleto.entity";
import { Comprobante } from "./comprobante.entity";

@Entity('pagos')
export class Pago {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column({ type: 'float' })
    amount: number;

    @Column({ nullable: true })
    lastCardDigits: string;

    @Column({ nullable: true })
    cardType: string;

    @Column({ type: 'enum', enum: TipoPago })
    paymentMethod: TipoPago;

    @Column({ type: 'enum', enum: EstadoPago, default: EstadoPago.PENDING })
    status: EstadoPago;

    @OneToOne(() => Boleto, (boleto) => boleto.pago)
    @JoinColumn({ name: 'boleto_id' })
    boleto: Boleto;

    @OneToOne(() => Comprobante, (comprobante) => comprobante.pago, { nullable: true, cascade: true })
    comprobante: Comprobante;

    @CreateDateColumn({ name: 'created_at', type: 'timestamptz' })
    createdAt: Date;
}