import { Injectable } from '@nestjs/common';
import { CreateRelationTypeDto } from './dto/create-relation-type.dto';
import { UpdateRelationTypeDto } from './dto/update-relation-type.dto';

@Injectable()
export class RelationTypesService {
  create(createRelationTypeDto: CreateRelationTypeDto) {
    return 'This action adds a new relationType';
  }

  findAll() {
    return `This action returns all relationTypes`;
  }

  findOne(id: number) {
    return `This action returns a #${id} relationType`;
  }

  update(id: number, updateRelationTypeDto: UpdateRelationTypeDto) {
    return `This action updates a #${id} relationType`;
  }

  remove(id: number) {
    return `This action removes a #${id} relationType`;
  }
}
