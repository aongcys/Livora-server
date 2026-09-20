import { envSchema, type Env } from './env.schema.js';

export function validateEnv(config: Record<string, unknown>): Env {
  const result = envSchema.safeParse(config);
  if (result.success) return result.data;

  const problems = result.error.issues.map(issue => {
    const name = issue.path.join('.');
    const reason =
      config[name] === undefined ? 'is required but missing' : issue.message;
    return `  - ${name}: ${reason}`;
  });

  throw new Error(
    `Invalid environment variables:\n${problems.join('\n')}\n` +
      'Check your .env file (see .env.example).',
  );
}
