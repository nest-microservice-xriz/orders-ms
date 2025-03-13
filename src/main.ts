import { Logger, ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { envs } from './conf';
import { MicroserviceOptions, Transport } from '@nestjs/microservices';

async function bootstrap() {
  const logger = new Logger('Main-Orders-ms')

  const app = await NestFactory.createMicroservice<MicroserviceOptions>(
    AppModule,{
    transport: Transport.NATS,
    options: {
      servers: envs.NATS_SERVERS
    }
  });


  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true
    })
  )

  await app.listen();
  logger.log(`Order-ms runninng on port ${envs.PORT}`) 

}
bootstrap();
``