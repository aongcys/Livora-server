import { defineConfig } from 'vitest/config';

export default defineConfig({
  resolve: { tsconfigPaths: true },
  test: {
    globals: true,
    root: './',
    include: ['**/*.e2e-spec.ts'],
    env: {
      NODE_ENV: 'test',
      PORT: '4200',
      CORS_ORIGIN: 'http://localhost:3200',
      // Fake: PrismaService is overridden with a mock in e2e tests.
      DATABASE_URL: 'postgresql://user:pass@localhost:5432/test',
    },
  },
});
