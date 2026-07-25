export enum UserStatus {
  Active = "active",
  Inactive = "inactive",
  Suspended = "suspended",
  Deleted = "deleted",
}

export function isValidUserStatus(value: string): value is UserStatus {
  return Object.values(UserStatus).includes(value as UserStatus);
}
