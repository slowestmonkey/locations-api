import { ReadStream } from 'node:fs';
import { calculateDistance } from '../shared/distance';
import {
  AreaLookupId,
  DistanceDetails,
  ILocationRepository,
  Location,
  LocationId,
  LocationTag,
} from './location';

export class LocationService {
  private areaMap: Map<AreaLookupId, Location[]>;

  constructor(private readonly locationRepository: ILocationRepository) {
    this.areaMap = new Map();
  }

  async fetchByTag(tag: LocationTag, isActive?: boolean): Promise<Location[]> {
    const locations = await this.locationRepository.fetchByTag(tag);

    return isActive === undefined
      ? locations
      : locations.filter((location) => location.isActive === isActive);
  }

  async fetchDistanceDetails(
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

    return { from: locationFrom, to: locationTo, unit: 'km', distance };
  }

  async lookupByArea(
    areaLookupId: AreaLookupId,
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

    this.areaMap.set(areaLookupId, foundByArea);
  }

  async fetchLookupByAreaResult(
    areaLookupId: AreaLookupId,
  ): Promise<Location[] | null> {
    const locations = this.areaMap.get(areaLookupId);

    if (!locations) {
      return null;
    }

    this.areaMap.delete(areaLookupId);

    return locations;
  }

  loadSource(): ReadStream {
    return this.locationRepository.loadSource();
  }
}
