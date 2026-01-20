import { Test, TestingModule } from '@nestjs/testing';
import { RelationTypesService } from './relation-types.service';

describe('RelationTypesService', () => {
  let service: RelationTypesService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [RelationTypesService],
    }).compile();

    service = module.get<RelationTypesService>(RelationTypesService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
