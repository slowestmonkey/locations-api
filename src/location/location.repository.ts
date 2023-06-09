import { readFile } from 'fs/promises';
import { createReadStream } from 'node:fs';
import {
  ILocationRepository,
  Location,
  LocationId,
  LocationTag,
} from './location';

export class LocationRepository implements ILocationRepository {
  private constructor(
    private readonly dataSourcePath: string,
    private readonly locations: Location[],
    private readonly tagsMap: Map<LocationTag, Location[]>,
  ) {}

  static async create(dataSourcePath: string): Promise<LocationRepository> {
    try {
      const data = await readFile(dataSourcePath, { encoding: 'utf8' });
      const locations: Location[] = JSON.parse(data);
      const tagsMap = new Map();

      locations.forEach((location) =>
        location.tags.forEach((tag) =>
          tagsMap.has(tag)
            ? tagsMap.get(tag).push(location)
            : tagsMap.set(tag, []),
        ),
      );

      return new LocationRepository(dataSourcePath, locations, tagsMap);
    } catch (error: any) {
      throw new Error(error.message);
    }
  }

  async fetch(id: LocationId) {
    return this.locations.find((location) => location.guid === id);
  }

  async fetchAll() {
    return this.locations;
  }

  async fetchByTag(tag: LocationTag) {
    return this.tagsMap.get(tag) ?? [];
  }

  loadSource() {
    return createReadStream(this.dataSourcePath);
  }
}
