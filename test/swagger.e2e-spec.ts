import { Test } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import request from 'supertest';
import type { Server } from 'node:http';
import { AppModule } from './../src/app.module.js';
import { setupApp } from './../src/app.setup.js';
import { PrismaService } from './../src/prisma/prisma.service.js';
import { setupSwagger } from './../src/swagger.setup.js';

async function createApp(withSwagger: boolean) {
  const moduleFixture = await Test.createTestingModule({
    imports: [AppModule],
  })
    .overrideProvider(PrismaService)
    .useValue({ $queryRaw: vi.fn() })
    .compile();

  const app: INestApplication<Server> = moduleFixture.createNestApplication();
  setupApp(app);
  if (withSwagger) setupSwagger(app);
  await app.init();
  return app;
}

describe('Swagger (e2e)', () => {
  it('is not exposed outside development (NODE_ENV=test here)', async () => {
    const app = await createApp(false);
    await request(app.getHttpServer()).get('/docs').expect(404);
    await request(app.getHttpServer()).get('/docs-json').expect(404);
    await app.close();
  });

  it('serves the UI and a document listing prefixed routes when set up', async () => {
    const app = await createApp(true);
    await request(app.getHttpServer()).get('/docs').expect(200);
    const res = await request(app.getHttpServer())
      .get('/docs-json')
      .expect(200);
    expect(res.body.info.title).toBe('Livora API');
    expect(Object.keys(res.body.paths)).toContain('/api/health');
    expect(res.body.components.securitySchemes).toHaveProperty('bearer');
    await app.close();
  });
});
