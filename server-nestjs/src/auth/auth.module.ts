import { Module } from '@nestjs/common';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';


import { userSchema } from '../schemas/user.schema';
import { MongooseModule } from '@nestjs/mongoose';

@Module({
  imports: [MongooseModule.forFeature([
    { name: 'User', schema: userSchema }
  ])],
  controllers: [AuthController],
  providers: [AuthService]
})
export class AuthModule { }
