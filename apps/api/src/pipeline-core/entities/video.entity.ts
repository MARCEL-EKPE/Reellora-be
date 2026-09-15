import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  OneToMany,
  OneToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { VideoStatus } from '../enums/video-status.enum';
import { NewsItem } from './news-item.entity';
import { Research } from './research.entity';
import { Script } from './script.entity';
import { VideoPlan } from './video-plan.entity';
import { MediaAsset } from './media-asset.entity';
import { QualityCheck } from './quality-check.entity';
import { Publication } from './publication.entity';

@Entity()
export class Video {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'enum', enum: VideoStatus, default: VideoStatus.REQUESTED })
  status: VideoStatus;

  @Column({ type: 'varchar', nullable: true })
  title?: string;

  @Column({ type: 'text', nullable: true })
  description?: string;

  @Column({ type: 'varchar', nullable: true })
  errorMessage?: string;

  @Column({ type: 'int', nullable: true })
  targetDurationSeconds?: number;

  @Column({ type: 'int', nullable: true })
  estimatedDurationSeconds?: number;

  @Column({ type: 'uuid' })
  newsItemId: string;

  @OneToOne(() => NewsItem, (newsItem) => newsItem.video, { cascade: true })
  @JoinColumn()
  newsItem: NewsItem;

  @OneToOne(() => Research, (research) => research.video, { cascade: true })
  @JoinColumn()
  research: Research;

  @OneToOne(() => Script, (script) => script.video, { cascade: true })
  @JoinColumn()
  script: Script;

  @OneToOne(() => VideoPlan, (plan) => plan.video, { cascade: true })
  @JoinColumn()
  videoPlan: VideoPlan;

  @OneToMany(() => MediaAsset, (asset) => asset.video, { cascade: true })
  assets: MediaAsset[];

  @OneToMany(() => QualityCheck, (qc) => qc.video, { cascade: true })
  qualityChecks: QualityCheck[];

  @OneToMany(() => Publication, (publication) => publication.video, {
    cascade: true,
  })
  publications: Publication[];

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
