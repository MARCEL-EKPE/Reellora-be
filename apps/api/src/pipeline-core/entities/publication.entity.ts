import {
  Column,
  CreateDateColumn,
  Entity,
  ManyToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { Video } from './video.entity';
import { Platform } from '../enums/platform.enum';

export type PublicationStatus =
  | 'pending'
  | 'uploading'
  | 'published'
  | 'failed';

@Entity()
export class Publication {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'enum', enum: Platform })
  platform: Platform;

  @Column({
    type: 'enum',
    enum: ['pending', 'uploading', 'published', 'failed'],
  })
  status: PublicationStatus;

  @Column({ type: 'varchar', nullable: true })
  platformVideoId?: string;

  @Column({ type: 'varchar', nullable: true })
  platformVideoUrl?: string;

  @Column({ type: 'text', nullable: true })
  errorMessage?: string;

  @Column({ type: 'timestamptz', nullable: true })
  publishedAt?: Date;

  @ManyToOne(() => Video, (video) => video.publications, {
    onDelete: 'CASCADE',
  })
  video: Video;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
