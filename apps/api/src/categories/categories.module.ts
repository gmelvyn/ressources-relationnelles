import { Global, Module } from '@nestjs/common';
import { CategoriesController } from './categories.controller';
import { CategoriesService } from './categories.service';
import { PrismaModule } from '../prisma/prisma.module';

@Global()
@Module({
  controllers: [CategoriesController],
  providers: [CategoriesService],
  imports: [PrismaModule],
})
export class CategoriesModule {}
