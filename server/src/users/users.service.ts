import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from './user.entity';
import * as bcrypt from 'bcrypt';

@Injectable()
export class UsersService {
  // התיקון: הביטוי הזה מאפשר כל תו מיוחד (כולל נקודה, מקף, רווח וכו')
  private readonly PASSWORD_REGEX = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[\W_]).{8,}$/;

  constructor(
    @InjectRepository(User)
    private usersRepository: Repository<User>,
  ) {}

  async findOneByEmail(email: string): Promise<User | null> {
    return this.usersRepository.findOneBy({ email });
  }

  async findById(id: number): Promise<User | null> {
    return this.usersRepository.findOneBy({ id });
  }

  async create(user: Partial<User>): Promise<User> {
    const newUser = this.usersRepository.create(user);
    return this.usersRepository.save(newUser);
  }

  async updateProfile(id: number, attrs: Partial<User>): Promise<User> {
    const user = await this.findById(id);
    if (!user) {
      throw new NotFoundException('User not found');
    }
    
    if (attrs.firstName) user.firstName = attrs.firstName;
    if (attrs.lastName) user.lastName = attrs.lastName;

    return this.usersRepository.save(user);
  }

  async updatePassword(id: number, plainPassword: string): Promise<void> {
    if (!plainPassword || !this.PASSWORD_REGEX.test(plainPassword)) {
        throw new BadRequestException(
          'Password must be at least 8 characters long, contain 1 uppercase, 1 lowercase, 1 number and 1 special character',
        );
    }

    const user = await this.findById(id);
    if (!user) {
      throw new NotFoundException('User not found');
    }
    
    const salt = await bcrypt.genSalt();
    const hash = await bcrypt.hash(plainPassword, salt);
    
    // שים לב: אנחנו משתמשים ב-'password' כדי להתאים לתיקון הקודם
    user.password = hash; 
    
    await this.usersRepository.save(user);
  }
}