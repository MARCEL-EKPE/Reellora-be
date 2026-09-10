import {
    Column,
    CreateDateColumn,
    Entity,
    JoinColumn,
    OneToOne,
    PrimaryGeneratedColumn,
    UpdateDateColumn,
} from 'typeorm';
import { Video } from './video.entity';

@Entity()
export class Script {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column({ type: 'text' })
    title: string;

    @Column({ type: 'text' })
    hook: string;

    @Column({ type: 'simple-json' })
    sections: string[];

    @Column({ type: 'text' })
    conclusion: string;

    @Column({ type: 'text' })
    fullText: string;

    @Column({ type: 'simple-json' })
    keywords: string[];

    @Column({ type: 'simple-json' })
    tags: string[];

    @Column({ type: 'varchar' })
    thumbnailConcept: string;

    @Column({ type: 'int' })
    estimatedDurationSeconds: number;

    @OneToOne(() => Video, (video) => video.script)
    @JoinColumn()
    video: Video;

    @CreateDateColumn()
    createdAt: Date;

    @UpdateDateColumn()
    updatedAt: Date;
}
