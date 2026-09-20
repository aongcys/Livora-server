import { ArgumentsHost, Logger, NotFoundException } from '@nestjs/common';
import { AppError, ErrorCode } from '../errors/app-error.js';
import { AllExceptionsFilter } from './all-exceptions.filter.js';

function createHost() {
  const json = vi.fn();
  const status = vi.fn().mockReturnValue({ json });
  const host = {
    switchToHttp: () => ({
      getRequest: () => ({ method: 'GET', url: '/x' }),
      getResponse: () => ({ status }),
    }),
  } as unknown as ArgumentsHost;
  return { host, status, json };
}

describe('AllExceptionsFilter', () => {
  const filter = new AllExceptionsFilter();

  beforeEach(() => {
    vi.spyOn(Logger.prototype, 'error').mockImplementation(() => undefined);
  });

  it('formats AppError with its code and details', () => {
    const { host, status, json } = createHost();
    filter.catch(
      new AppError(ErrorCode.CONFLICT, 'Username taken.', 409, { field: 'u' }),
      host,
    );
    expect(status).toHaveBeenCalledWith(409);
    expect(json).toHaveBeenCalledWith({
      statusCode: 409,
      code: 'CONFLICT',
      message: 'Username taken.',
      details: { field: 'u' },
    });
  });

  it('maps HttpException to a code by status', () => {
    const { host, status, json } = createHost();
    filter.catch(new NotFoundException('Task not found'), host);
    expect(status).toHaveBeenCalledWith(404);
    expect(json).toHaveBeenCalledWith(
      expect.objectContaining({ code: 'NOT_FOUND', message: 'Task not found' }),
    );
  });

  it('hides internal error details from the client', () => {
    const { host, status, json } = createHost();
    filter.catch(new Error('password authentication failed for db'), host);
    expect(status).toHaveBeenCalledWith(500);
    const body = json.mock.calls[0][0];
    expect(body.code).toBe('INTERNAL_ERROR');
    expect(JSON.stringify(body)).not.toContain('password');
  });
});
