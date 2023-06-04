import { Module } from '@nestjs/common';
import { join } from 'node:path';
import { LocationRepository } from './location.repository';
import { LocationService } from './location.service';

@Module({
  providers: [
    {
      provide: LocationService.name,
      useFactory: async () => {
        const filePath = join(__dirname, '../../db/locations.json');
        const locationRepository = await LocationRepository.create(filePath);

        return new LocationService(locationRepository);
      },
    },
  ],
  exports: [LocationService.name],
})
export class LocationModule {}
