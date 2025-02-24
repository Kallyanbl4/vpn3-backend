import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe, Logger } from '@nestjs/common';

async function bootstrap() {
  const logger = new Logger('Bootstrap');
  try {
    const app = await NestFactory.create(AppModule);
    app.useGlobalPipes(
      new ValidationPipe({
        transform: true, // Автоматически преобразовывать типы
        whitelist: true, // Удалять невалидные поля
        forbidNonWhitelisted: true, // Запрещать неизвестные поля
      }),
    );
    const port = process.env.PORT ?? 3000;
    await app.listen(port);
    logger.log(`Application is running on port ${port}`);
  } catch (error) {
    logger.error('Failed to start the application', error);
    process.exit(1);
  }
}
bootstrap();