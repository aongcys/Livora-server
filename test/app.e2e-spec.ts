import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, Logger } from '@nestjs/common';
import request from 'supertest';
import { App } from 'supertest/types';
import { AppModule } from './../src/app.module.js';
import { setupApp } from './../src/app.setup.js';
import { PrismaService } from './../src/prisma/prisma.service.js';

describe('AppController (e2e)', () => {
  let app: INestApplication<App>;
  const queryRaw = vi.fn();

  beforeEach(async () => {
    queryRaw.mockReset().mockResolvedValue([{ '?column?': 1 }]);
    vi.spyOn(Logger.prototype, 'warn').mockImplementation(() => undefined);

    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    })
      .overrideProvider(PrismaService)
      .useValue({ $queryRaw: queryRaw })
      .compile();

    app = moduleFixture.createNestApplication();
    setupApp(app);
    await app.init();
  });

  it('/api (GET)', () => {
    return request(app.getHttpServer())
      .get('/api')
      .expect(200)
      .expect('Hello World!');
  });

  it('returns the standard error body for unknown routes', () => {
    return request(app.getHttpServer())
      .get('/api/nope')
      .expect(404)
      .expect(res => {
        expect(res.body).toMatchObject({ statusCode: 404, code: 'NOT_FOUND' });
        expect(typeof res.body.message).toBe('string');
      });
  });

  it('/api/health reports ok when the database answers', () => {
    return request(app.getHttpServer())
      .get('/api/health')
      .expect(200)
      .expect({ status: 'ok', database: 'up' });
  });

  it('/api/health returns 503 DATABASE_UNAVAILABLE when the database is down', () => {
    queryRaw.mockRejectedValue(new Error('connect ECONNREFUSED secret-host'));
    return request(app.getHttpServer())
      .get('/api/health')
      .expect(503)
      .expect(res => {
        expect(res.body).toMatchObject({
          statusCode: 503,
          code: 'DATABASE_UNAVAILABLE',
        });
        expect(JSON.stringify(res.body)).not.toContain('secret-host');
      });
  });

  afterEach(async () => {
    await app.close();
  });
});
