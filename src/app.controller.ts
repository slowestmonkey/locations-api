import {
  Controller,
  Get,
  HttpStatus,
  Inject,
  Param,
  ParseBoolPipe,
  ParseIntPipe,
  Query,
  Res,
  UseGuards,
} from '@nestjs/common';
import { Response } from 'express';
import { AuthGuard } from './auth/auth.guard';
import {
  AreaLookupId,
  DistanceDetails,
  Location,
  LocationId,
  LocationTag,
} from './location/location';
import { LocationService } from './location/location.service';

@UseGuards(AuthGuard)
@Controller()
export class AppController {
  constructor(
    @Inject(LocationService.name)
    private readonly locationService: LocationService,
  ) {}

  @Get('/cities-by-tag')
  async fetchCitiesByTag(
    @Query('tag') tag: LocationTag,
    @Query('isActive', ParseBoolPipe) isActive: boolean,
  ): Promise<{ cities: Location[] }> {
    return { cities: await this.locationService.fetchByTag(tag, isActive) };
  }

  @Get('/distance')
  async fetchDistanceDetails(
    @Query('from') from: LocationId,
    @Query('to') to: LocationId,
  ): Promise<DistanceDetails> {
    return this.locationService.fetchDistanceDetails(from, to);
  }

  @Get('/area')
  async lookupByArea(
    @Query('from') from: LocationId,
    @Query('distance', ParseIntPipe) distance: number,
    @Res() res: Response,
  ): Promise<void> {
    const requestId = '2152f96f-50c7-4d76-9e18-f7033bd14428' as AreaLookupId;
    const resultsUrl = `http://127.0.0.1:8080/area-result/${requestId}`;

    res.status(HttpStatus.ACCEPTED).send({ resultsUrl });

    this.locationService.lookupByArea(requestId, from, distance);
  }

  @Get('/area-result/:areaLookupId')
  async fetchLookupByAreaResult(
    @Param('areaLookupId') areaLookupId: AreaLookupId,
    @Res() res: Response,
  ): Promise<void> {
    const foundByArea = await this.locationService.fetchLookupByAreaResult(
      areaLookupId,
    );

    foundByArea
      ? res.status(HttpStatus.OK).send({ cities: foundByArea })
      : res.status(HttpStatus.ACCEPTED).send();
  }

  @Get('/all-cities')
  async loadAllCities(@Res() res: Response): Promise<void> {
    const stream = this.locationService.loadSource();

    stream.pipe(res);
  }
}
