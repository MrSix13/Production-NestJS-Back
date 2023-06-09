import {
  ConflictException,
  Injectable,
  InternalServerErrorException,
} from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { Model } from "mongoose";
import { Users, UsersDocument } from "./schema/users.schema";
import { RegisterDTO } from "./dto/register.dto";
import { JwtPayload } from "../auth/jwt.strategy";
import { JwtService, JwtSignOptions } from "@nestjs/jwt";
import * as bcrypt from "bcrypt";

export interface IToken {
  access_token: string;
}

@Injectable()
export class UsersService {
  constructor(
    @InjectModel(Users.name) private readonly _usersModel: Model<UsersDocument>,
    private readonly jwtService: JwtService,
  ) {}

  async findById(id: string): Promise<Users> {
    return this._usersModel.findById(id).exec();
  }
  async findOne(email: string): Promise<Users> {
    return this._usersModel.findOne({ email }).exec();
  }

  async create(registerDTO: RegisterDTO): Promise<IToken> {
    const { email } = registerDTO;

    const existingUser = await this._usersModel.findOne({ email }).exec();
    if (existingUser) {
      throw new ConflictException("Email is alreay Exist");
    }
    const hashPassword = await bcrypt.hash(registerDTO.password, 10);
    try {
      const createdUser = new this._usersModel({
        ...registerDTO,
        password: hashPassword,
      });
      const payload: JwtPayload = {
        sub: email,
        name: createdUser.name,
        rol: "CLIENTE",
        email,
      };

      const signOption: JwtSignOptions = {
        expiresIn: 8493,
        secret: process.env.JWT_SECRET,
      };
      const token = this.jwtService.sign(payload, signOption);
      console.log("token", token);
      console.log("createdUser", createdUser);
      await createdUser.validate();
      await createdUser.save();
      console.log("token", "retornar token");
      return { access_token: token };
    } catch (error) {
      console.log(error);
      throw new InternalServerErrorException("Error Creating User");
    }
  }
}
