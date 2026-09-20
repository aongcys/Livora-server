import { defineConfig } from 'prisma/config';

export default defineConfig({
  schema: 'prisma/schema.prisma',
  migrations: { path: 'prisma/migrations' },
  // CLI (migrate/studio) uses the direct/session connection, not the pooled one.
  datasource: { url: process.env.DIRECT_URL },
});
