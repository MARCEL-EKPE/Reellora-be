import {
    Column,
    CreateDateColumn,
    Entity,
    ManyToOne,
    PrimaryGeneratedColumn,
    UpdateDateColumn,
} from 'typeorm';
import { Video } from './video.entity';

export type QualityCheckStatus = 'pending' | 'passed' | 'failed';

@Entity()
export class QualityCheck {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column({ type: 'enum', enum: ['pending', 'passed', 'failed'] })
    status: QualityCheckStatus;

    @Column({ type: 'varchar', nullable: true })
    checkedAssetType?: string;

    @Column({ type: 'simple-json', nullable: true })
    checks?: Record<string, unknown>;

    @Column({ type: 'text', nullable: true })
    errorMessage?: string;

    @ManyToOne(() => Video, (video) => video.qualityChecks, { onDelete: 'CASCADE' })
    video: Video;

    @CreateDateColumn()
    createdAt: Date;

    @UpdateDateColumn()
    updatedAt: Date;
}
