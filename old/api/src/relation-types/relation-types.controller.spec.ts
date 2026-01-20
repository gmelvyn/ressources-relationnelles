import { Test, TestingModule } from '@nestjs/testing';
import { RelationTypesController } from './relation-types.controller';
import { RelationTypesService } from './relation-types.service';

describe('RelationTypesController', () => {
  let controller: RelationTypesController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [RelationTypesController],
      providers: [RelationTypesService],
    }).compile();

    controller = module.get<RelationTypesController>(RelationTypesController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
