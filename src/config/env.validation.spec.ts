import { validateEnv } from './env.validation.js';

const valid = {
  NODE_ENV: 'development',
  PORT: '4200',
  CORS_ORIGIN: 'http://localhost:3200',
  DATABASE_URL: 'postgresql://user:pass@localhost:6543/postgres',
};

describe('validateEnv', () => {
  it('parses a valid environment', () => {
    expect(validateEnv(valid)).toEqual({
      NODE_ENV: 'development',
      PORT: 4200,
      CORS_ORIGIN: ['http://localhost:3200'],
      DATABASE_URL: 'postgresql://user:pass@localhost:6543/postgres',
    });
  });

  it('splits CORS_ORIGIN into a list', () => {
    const env = validateEnv({
      ...valid,
      CORS_ORIGIN: 'http://a.test, http://b.test',
    });
    expect(env.CORS_ORIGIN).toEqual(['http://a.test', 'http://b.test']);
  });

  it('reports every missing variable by name', () => {
    expect(() => validateEnv({})).toThrow(/NODE_ENV: is required but missing/);
    expect(() => validateEnv({})).toThrow(/PORT: is required but missing/);
    expect(() => validateEnv({})).toThrow(
      /CORS_ORIGIN: is required but missing/,
    );
    expect(() => validateEnv({})).toThrow(
      /DATABASE_URL: is required but missing/,
    );
  });

  it('names the invalid variable in the error', () => {
    expect(() => validateEnv({ ...valid, PORT: 'abc' })).toThrow(/PORT/);
    expect(() => validateEnv({ ...valid, NODE_ENV: 'staging' })).toThrow(
      /NODE_ENV/,
    );
    expect(() => validateEnv({ ...valid, DATABASE_URL: 'mysql://x' })).toThrow(
      /DATABASE_URL: must start with postgresql:\/\//,
    );
  });
});
