import type { INestApplication } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { AllExceptionsFilter } from './common/filters/all-exceptions.filter.js';
import type { Env } from './config/env.schema.js';
import { setupSwagger } from './swagger.setup.js';

/** Shared by main.ts and the e2e tests so both run the same setup. */
export function setupApp(app: INestApplication): void {
  const config = app.get<ConfigService<Env, true>>(ConfigService);

  app.setGlobalPrefix('api');
  app.useGlobalFilters(new AllExceptionsFilter());
  app.enableCors({ origin: config.get('CORS_ORIGIN', { infer: true }) });

  // API docs are only exposed in development.
  if (config.get('NODE_ENV', { infer: true }) === 'development') {
    setupSwagger(app);
  }
}
