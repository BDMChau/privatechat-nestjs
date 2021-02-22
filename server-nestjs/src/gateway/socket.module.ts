import { Module } from '@nestjs/common';
import { SocketGateway } from './socket.gateway';
import { MongooseModule } from '@nestjs/mongoose';
import { messageSchema } from '../schemas/message.schema';
import { userSchema } from '../schemas/user.schema';

@Module({
    imports: [MongooseModule.forFeature([
        { name: 'User', schema: userSchema },
        { name: 'Message', schema: messageSchema }
    ])],
    providers: [SocketGateway],
})
export class SocketModule { }