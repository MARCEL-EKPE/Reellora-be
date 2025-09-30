import { Column, CreateDateColumn, Entity, ManyToOne, PrimaryGeneratedColumn, UpdateDateColumn } from "typeorm";
import { Niche } from "./enums/niche.enums";
import { User } from "src/users/user.entity";

@Entity()
export class SocialAccounts {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column({ unique: true })
    channelId: string;

    @Column()
    channelName: string;

    @Column()
    niche: Niche;

    @ManyToOne(() => User, (user) => user.channels, {
        onDelete: 'CASCADE',
        eager: false
    })
    user: User

    @CreateDateColumn()
    createdAt: Date;

    @UpdateDateColumn()
    updatedAt: Date;
}