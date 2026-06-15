import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { Snapshot } from './snapshots/snapshot.entity';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),

    TypeOrmModule.forRoot({
      type: 'sqlite',
      database: 'database.sqlite',
      synchronize: true,
      autoLoadEntities: true,
      entities: [Snapshot],
    }),

    TypeOrmModule.forFeature([Snapshot]),
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule { }