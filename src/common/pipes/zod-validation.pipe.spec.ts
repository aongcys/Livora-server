import { z } from 'zod';
import { AppError } from '../errors/app-error.js';
import { ZodValidationPipe } from './zod-validation.pipe.js';

describe('ZodValidationPipe', () => {
  const pipe = new ZodValidationPipe(z.object({ name: z.string().min(1) }));

  it('returns parsed data when valid', () => {
    expect(pipe.transform({ name: 'Run' })).toEqual({ name: 'Run' });
  });

  it('throws VALIDATION_FAILED with per-field details', () => {
    try {
      pipe.transform({ name: '' });
      expect.unreachable();
    } catch (error) {
      expect(error).toBeInstanceOf(AppError);
      const appError = error as AppError;
      expect(appError.getStatus()).toBe(400);
      expect(appError.code).toBe('VALIDATION_FAILED');
      expect(appError.details).toEqual([
        { field: 'name', message: expect.any(String) },
      ]);
    }
  });
});
