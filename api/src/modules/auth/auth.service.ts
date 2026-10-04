import { ConflictException, Injectable, UnauthorizedException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { Model } from 'mongoose';
import { User, UserDocument } from '../users/user.schema';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';

@Injectable()
export class AuthService {
  constructor(
    @InjectModel(User.name) private readonly users: Model<UserDocument>,
    private readonly jwt: JwtService,
  ) {}

  private safeUser(user: UserDocument) {
    return {
      id: user._id.toString(),
      name: user.name,
      email: user.email,
      role: user.role,
      walletBalance: user.walletBalance,
      isActive: user.isActive,
    };
  }

  private token(user: UserDocument) {
    return this.jwt.sign({
      sub: user._id.toString(),
      email: user.email,
      role: user.role,
    });
  }

  async register(dto: RegisterDto) {
    const email = dto.email.trim().toLowerCase();
    const existing = await this.users.findOne({ email }).exec();
    if (existing) throw new ConflictException('An account with this email already exists.');

    const passwordHash = await bcrypt.hash(dto.password, 12);
    const user = await this.users.create({
      name: dto.name.trim(),
      email,
      passwordHash,
      role: 'customer',
      isActive: true,
      walletBalance: 0,
    });

    return { user: this.safeUser(user), accessToken: this.token(user) };
  }

  async login(dto: LoginDto) {
    const email = dto.email.trim().toLowerCase();
    const user = await this.users.findOne({ email }).select('+passwordHash').exec();

    if (!user || !user.isActive || !user.passwordHash) {
      throw new UnauthorizedException('Invalid email or password.');
    }

    const valid = await bcrypt.compare(dto.password, user.passwordHash);
    if (!valid) throw new UnauthorizedException('Invalid email or password.');

    return { user: this.safeUser(user), accessToken: this.token(user) };
  }

  async me(userId: string) {
    const user = await this.users.findById(userId).exec();
    if (!user || !user.isActive) throw new UnauthorizedException('Account is not available.');
    return this.safeUser(user);
  }
}
