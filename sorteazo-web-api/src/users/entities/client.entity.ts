import { Column, Entity, JoinColumn, OneToOne, PrimaryColumn } from "typeorm";
import { User } from "./user.entity";

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
}