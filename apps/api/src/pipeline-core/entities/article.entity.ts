import {
  Column,
  CreateDateColumn,
  Entity,
  OneToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { Video } from './video.entity';

@Entity()
export class Article {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  source: string;

  @Column()
  title: string;

  @Column({ type: 'text', nullable: true })
  summary?: string;

  @Column({ type: 'text', nullable: true })
  content?: string;

  @Column({ type: 'varchar', nullable: true })
  url?: string;

  @Column({ type: 'varchar', nullable: true })
  author?: string;

  @Column({ type: 'varchar', nullable: true })
  externalId?: string;

  @Column({ type: 'timestamptz', nullable: true })
  publishedAt?: Date;

  @CreateDateColumn()
  discoveredAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @OneToOne(() => Video, (video) => video.article)
  video: Video;
}
