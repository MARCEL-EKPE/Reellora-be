import {
  Column,
  CreateDateColumn,
  Entity,
  ManyToOne,
  OneToMany,
  OneToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { Category } from './category.entity';
import { ContentFeed } from './content-feed.entity';
import { NewsAsset } from './news-asset.entity';
import { Video } from './video.entity';

export enum NewsItemStatus {
  DISCOVERED = 'discovered',
  NORMALIZED = 'normalized',
  CATEGORIZED = 'categorized',
  PUBLISHED_TO_FEED = 'published_to_feed',
  AVAILABLE = 'available',
  ARCHIVED = 'archived',
}

@Entity()
export class NewsItem {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  title: string;

  @Column({ type: 'text', nullable: true })
  summary?: string;

  @Column({ type: 'text', nullable: true })
  content?: string;

  @Column()
  source: string;

  @Column({ type: 'varchar', nullable: true })
  sourceUrl?: string;

  @Column({ type: 'varchar', nullable: true })
  author?: string;

  @Column({ type: 'varchar', nullable: true })
  externalId?: string;

  @Column({ type: 'timestamptz', nullable: true })
  publishedAt?: Date;

  @Column({
    type: 'enum',
    enum: NewsItemStatus,
    default: NewsItemStatus.DISCOVERED,
  })
  status: NewsItemStatus;

  @Column({ type: 'uuid' })
  categoryId: string;

  @ManyToOne(() => Category, (category) => category.newsItems)
  category: Category;

  @Column({ type: 'uuid' })
  feedId: string;

  @ManyToOne(() => ContentFeed, (feed) => feed.newsItems)
  feed: ContentFeed;

  @OneToMany(() => NewsAsset, (asset) => asset.newsItem)
  assets: NewsAsset[];

  @OneToOne(() => Video, (video) => video.newsItem)
  video: Video;

  @CreateDateColumn()
  discoveredAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
