import { APP_PIPE } from "@nestjs/core";
import { ValidationPipe, HttpStatus } from "@nestjs/common";
import type { Provider } from "@nestjs/common";

export const ValidationPipeProvider: Provider = {
  provide: APP_PIPE,
  useFactory() {
    return new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
      stopAtFirstError: true,
      disableErrorMessages: false,
      errorHttpStatusCode: HttpStatus.UNPROCESSABLE_ENTITY,
    });
  },
};
