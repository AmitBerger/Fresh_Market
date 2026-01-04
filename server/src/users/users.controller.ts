import { Controller, Get, Body, UseGuards, Request, Patch, NotFoundException } from '@nestjs/common';
import { UsersService } from './users.service';
import { AuthGuard } from '@nestjs/passport';

@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @UseGuards(AuthGuard('jwt'))
  @Get('profile')
  async getProfile(@Request() req) {
    const user = await this.usersService.findById(req.user.userId);
    
    // התיקון: בדיקה אם המשתמש קיים לפני שניגשים לשדות שלו
    if (!user) {
        throw new NotFoundException('User not found');
    }

    const { passwordHash, ...result } = user;
    return result;
  }

  @UseGuards(AuthGuard('jwt'))
  @Patch('profile')
  async updateProfile(@Request() req, @Body() body: { firstName: string; lastName: string }) {
    const updatedUser = await this.usersService.updateProfile(req.user.userId, body);
    
    // updatedUser בטוח קיים כאן כי ה-Service זורק שגיאה אם לא
    const { passwordHash, ...result } = updatedUser;
    return result;
  }
}