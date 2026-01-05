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
    
    if (!user) {
        throw new NotFoundException('User not found');
    }

    // הסרת השדה password מהתשובה
    const { password, ...result } = user;
    return result;
  }

  @UseGuards(AuthGuard('jwt'))
  @Patch('profile')
  async updateProfile(@Request() req, @Body() body: { firstName: string; lastName: string }) {
    const updatedUser = await this.usersService.updateProfile(req.user.userId, body);
    const { password, ...result } = updatedUser;
    return result;
  }

  @UseGuards(AuthGuard('jwt'))
  @Patch('profile/password')
  async changePassword(@Request() req, @Body() body: { password: string }) {
    await this.usersService.updatePassword(req.user.userId, body.password);
    return { message: 'Password updated successfully' };
  }
}