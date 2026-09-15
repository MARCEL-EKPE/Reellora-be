import {
  Column,
  CreateDateColumn,
  Entity,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { Category } from './category.entity';
import { NewsItem } from './news-item.entity';

@Entity()
export class ContentFeed {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ unique: true })
  sourceId: string;

  @Column()
  name: string;

  @Column()
  url: string;

  @Column({ type: 'varchar', nullable: true })
  type?: string;

  @Column({ type: 'varchar', nullable: true })
  region?: string;

  @Column({ type: 'text', nullable: true })
  description?: string;

  @Column({ default: true })
  enabled: boolean;

  @Column({ type: 'int', default: 3600 })
  refreshIntervalSeconds: number;

  @ManyToOne(() => Category, (category) => category.feeds)
  category: Category;

  @Column()
  categoryId: string;

  @OneToMany(() => NewsItem, (newsItem) => newsItem.feed)
  newsItems: NewsItem[];

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
