import { Column, CreateDateColumn, Entity, PrimaryGeneratedColumn, BeforeInsert, BeforeUpdate } from "typeorm";
import * as bcrypt from 'bcryptjs';

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
        type: "timestamp",
        nullable: false
    })
    registeredAt: Date;

    @Column({ type: 'enum', enum: ['client', 'organizador'] })
    role: 'client' | 'organizador';

    @BeforeInsert()
    @BeforeUpdate()
    async hashPassword(): Promise<void> {
        if (this.password) {
            const saltRounds = 10;
            this.password = await bcrypt.hash(this.password, saltRounds);
        }
    }
}
