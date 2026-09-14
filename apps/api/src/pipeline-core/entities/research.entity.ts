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
export class Research {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'text' })
  summary: string;

  @Column({ type: 'simple-json' })
  keyFacts: string[];

  @Column({ type: 'simple-json' })
  entities: Record<string, unknown>[];

  @Column({ type: 'simple-json' })
  timeline: Record<string, unknown>[];

  @Column({ type: 'simple-json' })
  uncertainties: string[];

  @Column({ type: 'simple-json' })
  sources: Record<string, unknown>[];

  @Column({ type: 'text' })
  topic: string;

  @OneToOne(() => Video, (video) => video.research)
  @JoinColumn()
  video: Video;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
