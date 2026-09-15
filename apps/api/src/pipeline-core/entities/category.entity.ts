import {
  Column,
  CreateDateColumn,
  Entity,
  OneToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { ContentFeed } from './content-feed.entity';
import { NewsItem } from './news-item.entity';

@Entity()
export class Category {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  name: string;

  @Column({ unique: true })
  slug: string;

  @Column({ type: 'text', nullable: true })
  description?: string;

  @Column({ type: 'simple-array', nullable: true })
  targetPlatforms?: string[];

  @Column({ type: 'varchar', nullable: true })
  targetAudience?: string;

  @Column({ default: true })
  enabled: boolean;

  @OneToMany(() => ContentFeed, (feed) => feed.category)
  feeds: ContentFeed[];

  @OneToMany(() => NewsItem, (newsItem) => newsItem.category)
  newsItems: NewsItem[];

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
