import {
  Injectable,
  InternalServerErrorException,
  UnauthorizedException,
} from "@nestjs/common";
import { JwtService } from "@nestjs/jwt";
import * as bcrypt from "bcrypt";

import { LoginDTO } from "src/users/dto/login.dto";
import { UsersService } from "../users/users.service";
import { JwtPayload } from "./jwt.strategy";

export interface Token {
  access_token: string;
}

@Injectable()
export class AuthService {
  constructor(
    private readonly usersService: UsersService,
    private readonly jwtService: JwtService,
  ) {}

  async validateUserById(userId: string): Promise<any> {
    const user = await this.usersService.findOne(userId);

    if (!user) {
      throw new UnauthorizedException();
    }

    return user;
  }

  async login(loginDTO: LoginDTO): Promise<Token> {
    const { email, password } = loginDTO;
    try {
      const loginUser = await this.usersService.findOne(email);
      const passwordMatches = await bcrypt.compare(
        password,
        loginUser.password,
      );

      if (loginUser && passwordMatches) {
        const payload: JwtPayload = {
          sub: loginUser.email,
          name: loginUser.name,
          email: loginUser.email,
          rol: loginUser.rol,
        };
        try {
          const token = await this.jwtService.signAsync({
            sub: payload.email,
            name: payload.name,
            email: payload.email,
            rol: payload.rol,
          });
          return { access_token: token };
        } catch (error) {
          throw new InternalServerErrorException();
        }
      } else {
        throw new UnauthorizedException("Invalid Credentials");
      }
    } catch (e) {
      if (e instanceof UnauthorizedException) {
        throw e;
      } else {
        throw new InternalServerErrorException("Server Error");
      }
    }
  }
}
