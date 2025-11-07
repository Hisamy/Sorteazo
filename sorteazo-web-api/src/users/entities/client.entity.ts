import { Column, Entity, JoinColumn, OneToMany, OneToOne, PrimaryColumn } from "typeorm";
import { User } from "./user.entity";
import { Boleto } from "src/boletos/entities/boleto.entity";

@Entity('clients')
export class Client {

    @PrimaryColumn('uuid', { name: 'user_id' })
    userId: string;

    @OneToOne(() => User)
    @JoinColumn({ name: 'user_id' })
    user: User;

    @Column()
    adress: string;

    @Column({ name: 'zip_code' })
    zipCode: string;

    @OneToMany(() => Boleto, (boleto) => boleto.client)
    boletos: Boleto[];
}