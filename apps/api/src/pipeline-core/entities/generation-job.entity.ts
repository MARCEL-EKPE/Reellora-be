import {
  Column,
  CreateDateColumn,
  Entity,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { GenerationProvider } from '../enums/generation-provider.enum';

export type GenerationJobStatus =
  | 'pending'
  | 'processing'
  | 'completed'
  | 'failed';

@Entity()
export class GenerationJob {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  sceneId: string;

  @Column({
    type: 'enum',
    enum: GenerationProvider,
    default: GenerationProvider.RUNWAY,
  })
  provider: GenerationProvider;

  @Column({ type: 'varchar', nullable: true })
  providerTaskId?: string;

  @Column({ type: 'varchar', nullable: true })
  providerJobUrl?: string;

  @Column({
    type: 'enum',
    enum: ['pending', 'processing', 'completed', 'failed'],
  })
  status: GenerationJobStatus;

  @Column({ type: 'text', nullable: true })
  prompt?: string;

  @Column({ type: 'varchar', nullable: true })
  outputUrl?: string;

  @Column({ type: 'text', nullable: true })
  errorMessage?: string;

  @Column({ type: 'timestamptz', nullable: true })
  startedAt?: Date;

  @Column({ type: 'timestamptz', nullable: true })
  completedAt?: Date;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
