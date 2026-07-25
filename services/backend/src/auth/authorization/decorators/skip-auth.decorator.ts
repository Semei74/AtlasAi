import { SetMetadata, type CustomDecorator } from "@nestjs/common";

export const SKIP_AUTH_KEY = "skipAuth";

export const SkipAuth = (): CustomDecorator<typeof SKIP_AUTH_KEY> =>
  SetMetadata(SKIP_AUTH_KEY, true);
