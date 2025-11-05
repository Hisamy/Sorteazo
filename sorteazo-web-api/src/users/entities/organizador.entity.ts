import { Column, Entity, JoinColumn, OneToOne, PrimaryColumn } from "typeorm";
import { User } from "./user.entity";

@Entity('organizadores')
export class Organizador {

    @PrimaryColumn('uuid', { name: 'user_id' })
    userId: string;

    @OneToOne(() => User)
    @JoinColumn({ name: 'user_id' })
    user: User;

    @Column({ name: 'admin_name' })
    adminName: string;
}