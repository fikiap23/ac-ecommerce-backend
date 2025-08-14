import { SetMetadata } from '@nestjs/common';

export const Access = (...args: string[]) => SetMetadata('access', args);
