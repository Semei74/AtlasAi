import { assertUuid, isEmail } from "@atlas/validation";
import { ValidationError } from "@atlas/errors";

export class UserId {
  private constructor(public readonly value: string) {}

  public static create(value: string): UserId {
    assertUuid(value);
    return new UserId(value);
  }

  public equals(other: UserId): boolean {
    return this.value === other.value;
  }
}

export class Email {
  private constructor(public readonly value: string) {}

  public static create(value: string): Email {
    const trimmed = value.trim();

    if (!isEmail(trimmed)) {
      throw new ValidationError(`Invalid email address: '${trimmed}'`);
    }

    return new Email(trimmed.toLowerCase());
  }

  public equals(other: Email): boolean {
    return this.value === other.value;
  }
}

export class PasswordHash {
  private constructor(public readonly value: string) {}

  public static MIN_LENGTH = 60;

  public static create(value: string): PasswordHash {
    if (value.length < PasswordHash.MIN_LENGTH) {
      throw new ValidationError("Invalid password hash: too short");
    }

    return new PasswordHash(value);
  }

  public equals(other: PasswordHash): boolean {
    return this.value === other.value;
  }
}
