import { INestApplication } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import * as request from 'supertest';
import { AreaLookupId, Location, LocationTag } from '../src/location/location';
import { LocationService } from '../src/location/location.service';
import { AppModule } from './../src/app.module';

describe('App (e2e)', () => {
  let app: INestApplication;

  beforeEach(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();

    await app.init();
  });

  describe('/cities-by-tag (GET)', () => {
    it('should fail without authorization', async () => {
      return request(app.getHttpServer()).get('/cities-by-tag').expect(401);
    });

    it('should return active cities by tag', async () => {
      const tag = 'est' as LocationTag;
      const { body } = await request(app.getHttpServer())
        .get(`/cities-by-tag?tag=${tag}&isActive=true`)
        .set('Authorization', 'bearer dGhlc2VjcmV0dG9rZW4=')
        .expect(200);

      body.cities.forEach((location: Location) =>
        expect(location).toEqual(
          expect.objectContaining({
            isActive: true,
            tags: expect.arrayContaining([tag]),
          }),
        ),
      );
    });
  });

  describe('/distance (GET)', () => {
    it('should return distance between locations', async () => {
      const from = 'ed354fef-31d3-44a9-b92f-4a3bd7eb0408';
      const to = '17f4ceee-8270-4119-87c0-9c1ef946695e';

      const { body } = await request(app.getHttpServer())
        .get(`/distance?from=${from}&to=${to}`)
        .set('Authorization', 'bearer dGhlc2VjcmV0dG9rZW4=')
        .expect(200);

      expect(body.distance).toEqual(13376.38);
    });
  });

  describe('/area (GET)', () => {
    it('should lookup for locations by distance', async () => {
      const lookupByAreaSpy = jest.spyOn(
        app.get(LocationService.name),
        'lookupByArea',
      );

      const from = 'ed354fef-31d3-44a9-b92f-4a3bd7eb0408';
      const distance = 100;

      const { body } = await request(app.getHttpServer())
        .get(`/area?from=${from}&distance=${distance}`)
        .set('Authorization', 'bearer dGhlc2VjcmV0dG9rZW4=')
        .expect(202);

      expect(body).toEqual(
        expect.objectContaining({ resultsUrl: expect.any(String) }),
      );

      const resultsUrlParts = body.resultsUrl.split('/');
      const areaRequestId = resultsUrlParts[resultsUrlParts.length - 1];

      expect(lookupByAreaSpy).toBeCalledWith(areaRequestId, from, distance);
    });
  });

  describe('/area-result (GET)', () => {
    it('should return lookup locations result', async () => {
      const locationService = app.get(LocationService.name);
      const areaLookupId = '123' as AreaLookupId;
      const from = 'ed354fef-31d3-44a9-b92f-4a3bd7eb0408';
      const distance = 100;

      await locationService.lookupByArea(areaLookupId, from, distance);

      const { body } = await request(app.getHttpServer())
        .get(`/area-result/${areaLookupId}`)
        .set('Authorization', 'bearer dGhlc2VjcmV0dG9rZW4=')
        .expect(200);

      expect(body.cities).toHaveLength(2);
    });
  });
});
