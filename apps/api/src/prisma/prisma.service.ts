import { Injectable, OnModuleInit, OnModuleDestroy } from '@nestjs/common';
import { PrismaService as RootPrismaService } from '../../../../prisma/prisma.service';

@Injectable()
export class PrismaService extends RootPrismaService implements OnModuleInit, OnModuleDestroy {
  async onModuleInit() {
    await this.$connect();
  }

  async onModuleDestroy() {
    await this.$disconnect();
  }
}
