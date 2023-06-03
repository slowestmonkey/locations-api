import { ReadStream } from 'fs';

export type LocationId = string & { locationId: true };
export type LocationTag = string & { locationTag: true };
export type AreaRequestId = string & { areaRequestId: true };

export type Location = {
  guid: LocationId;
  isActive: boolean;
  location: string;
  latitude: number;
  longitude: number;
  tags: LocationTag[];
};

export type DistanceDetails = {
  from: Location;
  to: Location;
  unit: 'km' | 'mi';
  distance: number;
};

export type ILocationRepository = {
  fetch(id: LocationId): Promise<Location | undefined>;
  fetchAll(): Promise<Location[]>;
  fetchByTag(tag: LocationTag): Promise<Location[]>;
  loadAll(): ReadStream;
};
