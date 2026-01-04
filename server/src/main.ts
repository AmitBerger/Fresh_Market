import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  
  // חובה! מאפשר לריאקט (פורט 5173) לדבר עם השרת (פורט 3000)
  app.enableCors(); 
  
  await app.listen(3000);
}
bootstrap();