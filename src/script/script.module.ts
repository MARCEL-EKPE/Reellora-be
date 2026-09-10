import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import scriptConfig from './config/script.config';
import { ScriptProvider } from './providers/script.provider';

@Module({
  imports: [ConfigModule.forFeature(scriptConfig)],
  providers: [ScriptProvider],
  exports: [ScriptProvider],
})
export class ScriptModule {}
