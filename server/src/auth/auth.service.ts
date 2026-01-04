// src/auth/auth.service.ts
import { Injectable, UnauthorizedException, BadRequestException } from '@nestjs/common';
import { UsersService } from '../users/users.service';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';

@Injectable()
export class AuthService {
  constructor(
    private usersService: UsersService,
    private jwtService: JwtService,
  ) {}

  // עדכון החתימה: מקבלים שם פרטי ושם משפחה בנפרד
  async signUp(firstName: string, lastName: string, email: string, pass: string) {
    const existingUser = await this.usersService.findOneByEmail(email);
    if (existingUser) {
      throw new BadRequestException('User already exists');
    }

    const salt = await bcrypt.genSalt();
    const hashedPassword = await bcrypt.hash(pass, salt);

    // יצירת המשתמש עם השדות החדשים
    const newUser = await this.usersService.create({
      firstName,    // שינוי מ-fullName
      lastName,     // שדה חדש
      email,
      passwordHash: hashedPassword, // שינוי מ-password
    });

    return this.login(newUser);
  }

  // ולידציה לוגית
  async validateUser(email: string, pass: string): Promise<any> {
    const user = await this.usersService.findOneByEmail(email);
    
    // בדיקה מול passwordHash
    if (user && user.passwordHash && (await bcrypt.compare(pass, user.passwordHash))) {
      const { passwordHash, ...result } = user; // הסרת ה-Hash מהתוצאה
      return result;
    }
    return null;
  }

  // התחברות
  async login(user: any) {
    const payload = { email: user.email, sub: user.id, role: user.role };
    return {
      access_token: this.jwtService.sign(payload),
    };
  }

  // לוגין עם סיסמה
  async loginWithCredentials(email: string, pass: string) {
    const user = await this.usersService.findOneByEmail(email);
    
    // בדיקה מול passwordHash
    if (user && user.passwordHash && (await bcrypt.compare(pass, user.passwordHash))) {
       return this.login(user);
    }
    throw new UnauthorizedException('Invalid credentials');
  }
}