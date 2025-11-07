import { Column, Entity, JoinColumn, OneToMany, OneToOne, PrimaryColumn } from "typeorm";
import { User } from "./user.entity";
import { Sorteo } from "src/sorteos/entities/sorteo.entity";

@Entity('organizadores')
export class Organizador {

    @PrimaryColumn('uuid', { name: 'user_id' })
    userId: string;

    @OneToOne(() => User)
    @JoinColumn({ name: 'user_id' })
    user: User;

    @Column({ name: 'admin_name' })
    adminName: string;

    @OneToMany(() => Sorteo, (sorteo) => sorteo.organizador)
    sorteos: Sorteo[];
}