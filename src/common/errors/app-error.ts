import { HttpException } from '@nestjs/common';

export const ErrorCode = {
  VALIDATION_FAILED: 'VALIDATION_FAILED',
  BAD_REQUEST: 'BAD_REQUEST',
  UNAUTHORIZED: 'UNAUTHORIZED',
  FORBIDDEN: 'FORBIDDEN',
  NOT_FOUND: 'NOT_FOUND',
  CONFLICT: 'CONFLICT',
  INTERNAL_ERROR: 'INTERNAL_ERROR',
} as const;

export type ErrorCode = (typeof ErrorCode)[keyof typeof ErrorCode];

/** Domain error: a stable machine-readable code plus a human-readable cause. */
export class AppError extends HttpException {
  constructor(
    readonly code: ErrorCode | (string & {}),
    message: string,
    status: number,
    readonly details?: unknown,
  ) {
    super({ code, message, details }, status);
  }
}
