import { defineConfig } from 'vitest/config';

export default defineConfig({
  // Resolves the path aliases declared in tsconfig.json.
  resolve: { tsconfigPaths: true },
  test: {
    globals: true,
    root: './',
    include: ['**/*.spec.ts'],
    env: {
      NODE_ENV: 'test',
      PORT: '4200',
      CORS_ORIGIN: 'http://localhost:3200',
      // Fake: PrismaClient connects lazily, so tests never reach a database.
      DATABASE_URL: 'postgresql://user:pass@localhost:5432/test',
    },
  },
});
