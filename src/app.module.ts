import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { LocationModule } from './location/location.module';

@Module({ imports: [LocationModule], controllers: [AppController] })
export class AppModule {}
