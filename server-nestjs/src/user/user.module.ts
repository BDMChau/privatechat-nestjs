import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { messageSchema } from '../schemas/message.schema';
import { userSchema } from '../schemas/user.schema';
import { UserController } from './user.controller';
import { UserService } from './user.service';

@Module({
  imports: [MongooseModule.forFeature([
    { name: 'User', schema: userSchema },
    { name: 'Message', schema: messageSchema }
  ])],
  controllers: [UserController],
  providers: [UserService]
})
export class UserModule {}
