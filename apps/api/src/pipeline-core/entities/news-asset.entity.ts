import {
  Column,
  CreateDateColumn,
  Entity,
  ManyToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { NewsItem } from './news-item.entity';

@Entity()
export class NewsAsset {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  newsItemId: string;

  @ManyToOne(() => NewsItem, (newsItem) => newsItem.assets, { onDelete: 'CASCADE' })
  newsItem: NewsItem;

  @Column()
  type: string;

  @Column()
  sourceUrl: string;

  @Column({ type: 'varchar', nullable: true })
  storageKey?: string;

  @Column({ type: 'varchar', nullable: true })
  mimeType?: string;

  @Column({ type: 'int', nullable: true })
  width?: number;

  @Column({ type: 'int', nullable: true })
  height?: number;

  @Column({ type: 'float', nullable: true })
  durationSeconds?: number;

  @Column({ type: 'text', nullable: true })
  caption?: string;

  @Column({ type: 'text', nullable: true })
  attribution?: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
