import { Injectable, UnauthorizedException, BadRequestException } from '@nestjs/common';
import { UsersService } from '../users/users.service';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';

@Injectable()
export class AuthService {
  private readonly EMAIL_REGEX = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
  // אותו ביטוי גמיש ומתוקן
  private readonly PASSWORD_REGEX = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[\W_]).{8,}$/;

  constructor(
    private usersService: UsersService,
    private jwtService: JwtService,
  ) {}

  private validateEmail(email: string): boolean {
    return this.EMAIL_REGEX.test(email);
  }

  private validatePassword(pass: string): boolean {
    return this.PASSWORD_REGEX.test(pass);
  }

  async signUp(firstName: string, lastName: string, email: string, pass: string) {
    if (!firstName || !lastName) throw new BadRequestException('Names are required');
    
    if (!email || !this.validateEmail(email)) {
        throw new BadRequestException('Invalid email format');
    }

    if (!pass || !this.validatePassword(pass)) {
        throw new BadRequestException(
            'Password must be at least 8 characters long, contain 1 uppercase, 1 lowercase, 1 number and 1 special character'
        );
    }

    const existingUser = await this.usersService.findOneByEmail(email);
    if (existingUser) {
      throw new BadRequestException('User already exists');
    }

    const salt = await bcrypt.genSalt();
    const hashedPassword = await bcrypt.hash(pass, salt);

    const newUser = await this.usersService.create({
      firstName,
      lastName,
      email,
      password: hashedPassword, // שימוש ב-password (השדה המתוקן)
    });

    return this.login(newUser);
  }

  async loginWithCredentials(email: string, pass: string) {
    const user = await this.usersService.findOneByEmail(email);
    
    // בדיקה תקינה
    if (user && user.password && (await bcrypt.compare(pass, user.password))) {
       return this.login(user);
    }

    throw new UnauthorizedException('Invalid credentials');
  }

  private async login(user: any) {
    const payload = { email: user.email, sub: user.id, role: user.role };
    return {
      access_token: this.jwtService.sign(payload),
    };
  }
}