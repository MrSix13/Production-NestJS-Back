import { Injectable, UnauthorizedException } from "@nestjs/common";
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
    private readonly jwtService: JwtService
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
      console.log("loginuser", loginUser);
      const passwordMatches = await bcrypt.compare(
        password,
        loginUser.password
      );
      console.log("passwordMatched", passwordMatches);

      if (loginUser && passwordMatches) {
        console.log("if");
        const payload: JwtPayload = {
          sub: loginUser.email,
          email: loginUser.email,
          rol: loginUser.rol,
          phoneNumber: loginUser.phoneNumber,
        };
        console.log("payload", payload);

        const token = await this.jwtService.signAsync({
          sub: payload.email,
          email: payload.email,
          rol: payload.rol,
        });
        console.log("token", token);
        return {
          access_token: token,
        };
      } else {
        throw new UnauthorizedException("Invalid Credentials");
      }
    } catch (error) {
      throw new UnauthorizedException("Server Error");
    }
  }
}
