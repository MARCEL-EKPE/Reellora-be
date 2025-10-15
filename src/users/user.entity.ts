import { Column, CreateDateColumn, Entity, OneToMany, PrimaryGeneratedColumn, UpdateDateColumn } from "typeorm";
import { UserPreferencesDto } from "./dtos/user-preferences.dto";
import { ApiProperty } from "@nestjs/swagger";
import { Exclude } from "class-transformer";
import { SocialAccounts } from "src/social-accounts/social-accounts.entity";

@Entity()
export class User {
    @ApiProperty({ example: 'a3bb189e-8bf9-3888-9912-2344c0d4b308' })
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @ApiProperty({ example: 'john.doe@gmail.com' })
    @Column({ unique: true })
    email: string;

    @ApiProperty({ example: 'JohnDoe' })
    @Column()
    userName: string;

    @Exclude()
    @ApiProperty({ example: '$2b$10$xyz...' })
    @Column({ nullable: true })
    password: string;

    @Exclude()
    @ApiProperty()
    @Column({ nullable: true })
    googleId?: string;

    @ApiProperty({
        description: 'User preferences stored as JSON',
        type: () => UserPreferencesDto,
        required: false,
    })
    @Column({
        type: 'jsonb',
        nullable: true,
        default: () => `'{ "frequencyOfUpload": 1, "autoPost": true, "replyTone": "PROFESSIONAL" }'`,
    })
    preferences?: Partial<UserPreferencesDto>

    @OneToMany(() => SocialAccounts, (channel) => channel.user, {
        cascade: true,
    })
    channels: SocialAccounts[];

    @Exclude()
    @CreateDateColumn()
    createdAt: Date;

    @Exclude()
    @UpdateDateColumn()
    updatedAt: Date;
} 