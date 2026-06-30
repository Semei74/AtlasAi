import { SetMetadata, type CustomDecorator } from "@nestjs/common";

export const ROLES_KEY = "roles";

export const Roles = (...roles: string[]): CustomDecorator<typeof ROLES_KEY> =>
  SetMetadata(ROLES_KEY, roles);
