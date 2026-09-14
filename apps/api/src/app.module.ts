import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { UsersModule } from './users/users.module';
import { SocialAccountsModule } from './social-accounts/social-accounts.module';
import { AuthModule } from './auth/auth.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule, ConfigService } from '@nestjs/config';
import databaseConfig from './config/database.config';
import envValidation from './config/env.validation';
import { APP_GUARD, APP_INTERCEPTOR } from '@nestjs/core';
import { AuthenticationGuard } from './auth/guards/authentication.guard';
import { DataResponseInterceptor } from './common/interceptors/data-response.interceptor';
import { AdminSeedService } from './seeds/admin.seed.service';
import appConfig from './config/app.config';
import { User } from './users/user.entity';
import { MediaProcessingModule } from './media-processing/media-processing.module';
import { BullModule, type BullRootModuleOptions } from '@nestjs/bullmq';
import { ScheduleModule } from '@nestjs/schedule';
import { AppMcpModule } from './mcp/mcp.module';
import { ContentIngestionModule } from './content-ingestion/content-ingestion.module';
import { RedisModule } from './common/redis/redis.module';
import { PipelineCoreModule } from './pipeline-core/pipeline-core.module';
import { PipelineQueuesModule } from './pipeline-queues/pipeline-queues.module';
import { ResearchModule } from './research/research.module';
import { ScriptModule } from './script/script.module';
import { VideoPlanningModule } from './video-planning/video-planning.module';
import { VideoGenerationModule } from './video-generation/video-generation.module';
import { AssetsModule } from './assets/assets.module';
import { QualityControlModule } from './quality-control/quality-control.module';
import { PublishingModule } from './publishing/publishing.module';
import { OpenAiModule } from './openai/openai.module';

const bullConfig = {
  connection: {
    host: process.env.REDIS_HOST ?? 'localhost',
    port: Number(process.env.REDIS_PORT ?? 6379),
  },
  defaultJobOptions: {
    attempts: 3,
  },
};

@Module({
  imports: [
    UsersModule,
    SocialAccountsModule,
    AuthModule,
    MediaProcessingModule,
    OpenAiModule,
    PipelineCoreModule,
    PipelineQueuesModule,
    ContentIngestionModule,
    ResearchModule,
    ScriptModule,
    VideoPlanningModule,
    VideoGenerationModule,
    AssetsModule,
    QualityControlModule,
    PublishingModule,
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: ['.env', '../../.env'],
      load: [databaseConfig, appConfig],
      validationSchema: envValidation,
    }),
    RedisModule,
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        type: 'postgres',
        host: configService.get('database.host'),
        port: configService.get('database.port'),
        username: configService.get('database.username'),
        password: configService.get('database.password'),
        database: configService.get('database.database'),
        synchronize: configService.get('database.synchronize'),
        autoLoadEntities: configService.get('database.autoLoadEntities'),
        // logging: true
      }),
    }),
    TypeOrmModule.forFeature([User]),
    BullModule.forRoot(bullConfig as unknown as BullRootModuleOptions),
    ScheduleModule.forRoot(),
    AppMcpModule,
    ContentIngestionModule,
  ],
  controllers: [AppController],
  providers: [
    AppService,
    {
      provide: APP_GUARD,
      useClass: AuthenticationGuard,
    },
    {
      provide: APP_INTERCEPTOR,
      useClass: DataResponseInterceptor,
    },
    AdminSeedService,
  ],
})
export class AppModule {}
