import { ExtractJwt, Strategy } from 'passport-jwt';
import { PassportStrategy } from '@nestjs/passport';
import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(configService: ConfigService) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: configService.get<string>('JWT_SECRET') || 'MySuperSecretKey123', // חייב להתאים ל-AuthModule
    });
  }

  async validate(payload: any) {
    // מה שמוחזר מכאן נכנס לתוך request.user
    return { userId: payload.sub, email: payload.email, role: payload.role };
  }
}