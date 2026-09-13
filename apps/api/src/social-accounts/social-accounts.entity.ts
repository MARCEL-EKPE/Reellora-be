import { Column, CreateDateColumn, Entity, ManyToOne, PrimaryGeneratedColumn, UpdateDateColumn } from "typeorm";
import { Niche } from "./enums/niche.enums";
import { User } from "src/users/user.entity";
import { CryptoServiceProvider } from "./providers/crypto-service.provider";
import { Platform } from "./enums/platform.enums";

let cryptoServiceProvider: CryptoServiceProvider

export function setCryptoServiceProvider(service: CryptoServiceProvider) {
    cryptoServiceProvider = service
}


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

    @Column()
    platform: Platform;

    @Column()
    thumbnail: string;

    @Column({
        transformer: {
            to: (value: string) => value ? cryptoServiceProvider.encrypt(value) : value,
            from: (value: string) => value ? cryptoServiceProvider.decrypt(value) : value,
        }
    })
    accessToken: string;

    @Column({
        transformer: {
            to: (value: string) => value ? cryptoServiceProvider.encrypt(value) : value,
            from: (value: string) => value ? cryptoServiceProvider.decrypt(value) : value,
        }
    })
    refreshToken: string;

    @Column()
    tokenExpiry: number;

    @ManyToOne(() => User, (user) => user.channels, {
        onDelete: 'CASCADE',
        eager: false
    })
    user: User;

    @CreateDateColumn()
    createdAt: Date;

    @UpdateDateColumn()
    updatedAt: Date;
}