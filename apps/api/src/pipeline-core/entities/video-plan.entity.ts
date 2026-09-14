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
import { Video } from './video.entity';
import { VideoScene } from './video-scene.entity';

@Entity()
export class VideoPlan {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'text', nullable: true })
  title?: string;

  @Column({ type: 'int', nullable: true })
  estimatedDurationSeconds?: number;

  @OneToOne(() => Video, (video) => video.videoPlan)
  @JoinColumn()
  video: Video;

  @OneToMany(() => VideoScene, (scene) => scene.videoPlan, { cascade: true })
  scenes: VideoScene[];

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
