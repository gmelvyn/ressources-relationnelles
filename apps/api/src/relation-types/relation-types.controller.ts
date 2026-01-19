import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { RelationTypesService } from './relation-types.service';
import { CreateRelationTypeDto } from './dto/create-relation-type.dto';
import { UpdateRelationTypeDto } from './dto/update-relation-type.dto';

@Controller('relation-types')
export class RelationTypesController {
  constructor(private readonly relationTypesService: RelationTypesService) {}

  @Post()
  create(@Body() createRelationTypeDto: CreateRelationTypeDto) {
    return this.relationTypesService.create(createRelationTypeDto);
  }

  @Get()
  findAll() {
    return this.relationTypesService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.relationTypesService.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateRelationTypeDto: UpdateRelationTypeDto) {
    return this.relationTypesService.update(+id, updateRelationTypeDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.relationTypesService.remove(+id);
  }
}
