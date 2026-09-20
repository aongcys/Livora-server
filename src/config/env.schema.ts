import { z } from 'zod';

export const envSchema = z.object({
  NODE_ENV: z.enum(['development', 'test', 'production']),
  PORT: z.coerce.number().int().min(1).max(65535),
  // Pooled (transaction) connection used by the running app.
  DATABASE_URL: z
    .string()
    .refine(
      v => /^postgres(ql)?:\/\//.test(v),
      'must start with postgresql://',
    ),
  // Comma-separated list of allowed browser origins.
  CORS_ORIGIN: z
    .string()
    .min(1)
    .transform(value =>
      value
        .split(',')
        .map(origin => origin.trim())
        .filter(Boolean),
    )
    .refine(origins => origins.length > 0, 'must contain at least one origin'),
});

export type Env = z.output<typeof envSchema>;
