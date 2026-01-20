import { PartialType } from '@nestjs/mapped-types';
import { CreateRelationTypeDto } from './create-relation-type.dto';

export class UpdateRelationTypeDto extends PartialType(CreateRelationTypeDto) {}
