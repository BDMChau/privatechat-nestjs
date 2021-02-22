import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import corsOptions from '../config/cors'
require('dotenv').config()

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.enableCors(corsOptions);
  await app.listen(5000 || process.env.PORT);
}
bootstrap();
