import { Controller, Get, Logger } from '@nestjs/common';
import {
  ApiOkResponse,
  ApiOperation,
  ApiServiceUnavailableResponse,
  ApiTags,
} from '@nestjs/swagger';
import { AppError } from '../common/errors/app-error.js';
import { PrismaService } from '../prisma/prisma.service.js';

@ApiTags('health')
@Controller('health')
export class HealthController {
  private readonly logger = new Logger(HealthController.name);

  constructor(private readonly prisma: PrismaService) {}

  @Get()
  @ApiOperation({ summary: 'Check that the API can reach the database' })
  @ApiOkResponse({
    schema: {
      example: { status: 'ok', database: 'up' },
    },
  })
  @ApiServiceUnavailableResponse({
    description: 'The database cannot be reached',
    schema: {
      example: {
        statusCode: 503,
        code: 'DATABASE_UNAVAILABLE',
        message: 'Cannot reach the database.',
      },
    },
  })
  async check() {
    try {
      await this.prisma.$queryRaw`SELECT 1`;
    } catch (error) {
      this.logger.warn(`Database check failed: ${String(error)}`);
      throw new AppError(
        'DATABASE_UNAVAILABLE',
        'Cannot reach the database.',
        503,
      );
    }
    return { status: 'ok', database: 'up' };
  }
}
