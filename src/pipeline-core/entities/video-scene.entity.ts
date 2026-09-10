import {
    Column,
    CreateDateColumn,
    Entity,
    ManyToOne,
    OneToMany,
    PrimaryGeneratedColumn,
    UpdateDateColumn,
} from 'typeorm';
import { VideoPlan } from './video-plan.entity';
import { MediaAsset } from './media-asset.entity';
import { SceneStatus } from '../enums/scene-status.enum';

@Entity()
export class VideoScene {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column({ type: 'int' })
    order: number;

    @Column({ type: 'text', nullable: true })
    narration?: string;

    @Column({ type: 'int', nullable: true })
    durationSeconds?: number;

    @Column({ type: 'simple-json', nullable: true })
    visual?: Record<string, unknown>;

    @Column({ type: 'simple-json', nullable: true })
    transition?: Record<string, unknown>;

    @Column({ type: 'enum', enum: SceneStatus, default: SceneStatus.PENDING })
    status: SceneStatus;

    @Column({ type: 'varchar', nullable: true })
    errorMessage?: string;

    @ManyToOne(() => VideoPlan, (plan) => plan.scenes, { onDelete: 'CASCADE' })
    videoPlan: VideoPlan;

    @OneToMany(() => MediaAsset, (asset) => asset.scene, { cascade: true })
    assets: MediaAsset[];

    @CreateDateColumn()
    createdAt: Date;

    @UpdateDateColumn()
    updatedAt: Date;
}
