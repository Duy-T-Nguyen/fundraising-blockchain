import { NestFactory } from '@nestjs/core';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  const config = new DocumentBuilder()
    .setTitle('Fundraising Blockchain API')
    .setDescription('Tài liệu API cho hệ thống gây quỹ Blockchain minh bạch')
    .setVersion('1.0')
    .addTag('Evidence', 'Xử lý hình ảnh minh chứng')
    .build();
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api', app, document);

  // Enable CORS for frontend connectivity
  app.enableCors();

  await app.listen(process.env.PORT ?? 3000);
}
bootstrap();
