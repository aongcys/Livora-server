import { PipeTransform } from '@nestjs/common';
import type { z } from 'zod';
import { AppError, ErrorCode } from '../errors/app-error.js';

export class ZodValidationPipe<T extends z.ZodType> implements PipeTransform<
  unknown,
  z.output<T>
> {
  constructor(private readonly schema: T) {}

  transform(value: unknown): z.output<T> {
    const result = this.schema.safeParse(value);
    if (result.success) return result.data;

    throw new AppError(
      ErrorCode.VALIDATION_FAILED,
      'Some fields are invalid.',
      400,
      result.error.issues.map(issue => ({
        field: issue.path.join('.'),
        message: issue.message,
      })),
    );
  }
}
