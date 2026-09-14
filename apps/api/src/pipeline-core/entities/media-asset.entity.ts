import {
  Column,
  CreateDateColumn,
  Entity,
  ManyToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { Video } from './video.entity';
import { VideoScene } from './video-scene.entity';
import { AssetType } from '../enums/asset-type.enum';

@Entity()
export class MediaAsset {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'enum', enum: AssetType })
  type: AssetType;

  @Column()
  storageKey: string;

  @Column()
  url: string;

  @Column({ type: 'varchar', nullable: true })
  mimeType?: string;

  @Column({ type: 'bigint', nullable: true })
  sizeBytes?: number;

  @Column({ type: 'float', nullable: true })
  durationSeconds?: number;

  @Column({ type: 'simple-json', nullable: true })
  metadata?: Record<string, unknown>;

  @ManyToOne(() => Video, (video) => video.assets, { onDelete: 'CASCADE' })
  video: Video;

  @ManyToOne(() => VideoScene, (scene) => scene.assets, {
    onDelete: 'CASCADE',
    nullable: true,
  })
  scene?: VideoScene;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
