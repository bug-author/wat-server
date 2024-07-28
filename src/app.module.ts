import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ConfigModule } from '@nestjs/config';
import { CacheModule } from '@nestjs/cache-manager';

@Module({
  imports: [
    ConfigModule.forRoot(),
    CacheModule.register({
      ttl: 60 * 1000, // seconds
    }),
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
