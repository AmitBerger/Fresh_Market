import { Body, Controller, Post, HttpCode, HttpStatus } from '@nestjs/common';
import { AuthService } from './auth.service';

@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @Post('signup')
  signUp(@Body() signUpDto: Record<string, any>) {
    // התיקון: מעבירים את כל 4 הפרמטרים בסדר הנכון
    return this.authService.signUp(
      signUpDto.firstName, 
      signUpDto.lastName, 
      signUpDto.email, 
      signUpDto.password
    );
  }

  @HttpCode(HttpStatus.OK)
  @Post('login')
  signIn(@Body() signInDto: Record<string, any>) {
    return this.authService.loginWithCredentials(signInDto.email, signInDto.password);
  }
}