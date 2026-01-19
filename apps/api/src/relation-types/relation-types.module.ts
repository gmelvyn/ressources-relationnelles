import { Module } from '@nestjs/common';
import { RelationTypesService } from './relation-types.service';
import { RelationTypesController } from './relation-types.controller';

@Module({
  controllers: [RelationTypesController],
  providers: [RelationTypesService],
})
export class RelationTypesModule {}
