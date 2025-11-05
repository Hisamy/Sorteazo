import { Column, CreateDateColumn, Entity, PrimaryGeneratedColumn } from "typeorm";

@Entity('users')
export class User {

    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column({ name: 'full_name' })
    name: string;

    @Column({ unique: true })
    email: string;

    @Column()
    password: string;

    @CreateDateColumn({
        name: "registered_at",
        type: "timestamptz",
        nullable: false
    })
    registeredAt: Date;

    @Column({ type: 'enum', enum: ['client', 'organizador'] })
    role: 'client' | 'organizador';
}
