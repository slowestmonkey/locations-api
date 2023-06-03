import { ReadStream } from 'node:fs';
import { calculateDistance } from '../shared/distance';
import {
  Location,
  LocationId,
  LocationTag,
  AreaRequestId,
  DistanceDetails,
  ILocationRepository,
} from './location';

export class LocationService {
  private areaMap: Map<AreaRequestId, Location[]>;

  constructor(private readonly locationRepository: ILocationRepository) {
    this.areaMap = new Map();
  }

  async fetchByTag(tag: LocationTag, isActive?: boolean): Promise<Location[]> {
    const locations = await this.locationRepository.fetchByTag(tag);

    return isActive === undefined
      ? locations
      : locations.filter((location) => location.isActive === isActive);
  }

  async fetchDistance(
    from: LocationId,
    to: LocationId,
  ): Promise<DistanceDetails> {
    const [locationFrom, locationTo] = await Promise.all([
      this.locationRepository.fetch(from),
      this.locationRepository.fetch(to),
    ]);

    if (!locationFrom || !locationTo) {
      throw new Error('Cannot calculate the distance');
    }

    const distance = calculateDistance(locationFrom, locationTo);

    return { from: locationFrom, to: locationTo, distance, unit: 'km' };
  }

  async lookupByArea(
    requestId: AreaRequestId,
    from: LocationId,
    distance: number,
  ): Promise<void> {
    const [locationFrom, locations] = await Promise.all([
      this.locationRepository.fetch(from),
      this.locationRepository.fetchAll(),
    ]);

    const foundByArea = locationFrom
      ? locations.filter(
          (location) =>
            location.guid !== locationFrom.guid &&
            calculateDistance(locationFrom, location) <= distance,
        )
      : [];

    this.areaMap.set(requestId, foundByArea);
  }

  async fetchLookupByAreaResult(
    requestId: AreaRequestId,
  ): Promise<Location[] | null> {
    const locations = this.areaMap.get(requestId);

    this.areaMap.delete(requestId);

    return locations ?? null;
  }

  loadAll(): ReadStream {
    return this.locationRepository.loadAll();
  }
}
