import { Injectable, UnauthorizedException } from '@nestjs/common';
import { UsersService } from '../users/users.service';
import { compare, genSalt, hash } from 'bcrypt';
@Injectable()
export class AuthService {
  constructor(private userService: UsersService) {}

  async signIn(username: string, password: string) {
    const user = await this.userService.findOneByName(username);

    const isMatch = await compare(password, user.password);

    if (!isMatch) {
      throw new UnauthorizedException('Invalid credentials');
    }

    return user;
  }

  async signUp(username: string, password: string, email: string) {
    const salt = await genSalt();
    const hashedPassword = await hash(password, salt);

    const newUser = this.userService.create({
      username: username,
      password: hashedPassword,
      email: email,
    });

    return newUser;
  }
}
