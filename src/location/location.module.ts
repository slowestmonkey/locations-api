import { Module } from '@nestjs/common';
import path from 'node:path';
import { LocationRepository } from './location.repository';
import { LocationService } from './location.service';

@Module({
  providers: [
    {
      provide: LocationService.name,
      useFactory: async () => {
        const filePath = path.join(__dirname, '../../db/locations.json');

        return new LocationService(await LocationRepository.create(filePath));
      },
    },
  ],
  exports: [LocationService.name],
})
export class LocationModule {}
