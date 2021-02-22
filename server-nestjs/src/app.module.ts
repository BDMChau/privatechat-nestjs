import { Module, NestModule, MiddlewareConsumer } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthModule } from './auth/auth.module';
import { MongooseModule } from '@nestjs/mongoose';
import keys from '../config/keys';
import { SocketModule } from './gateway/socket.module';
import { AuthMiddleware } from './middleware/auth/auth.middleware';
import { userSchema } from './schemas/user.schema';
import { UserController } from './user/user.controller';
import { UserModule } from './user/user.module';
import { messageSchema } from './schemas/message.schema';

@Module({
  imports: [
    AuthModule,
    UserModule,
    MongooseModule.forRoot(keys.MONGOURI),
    SocketModule,
    MongooseModule.forFeature([
      { name: 'User', schema: userSchema },
      { name: 'Message', schema: messageSchema }
    ])
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer
      .apply(AuthMiddleware)
      .forRoutes(UserController);
  }
}
