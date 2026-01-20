import { CreateUserDto } from '../../users/dto/create-user.dto';
import { IsString, MinLength } from 'class-validator';

export class SignUpDto extends CreateUserDto {
  @IsString()
  @MinLength(8)
  password: string;
}
