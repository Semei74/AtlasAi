import { assertNonEmptyString } from "@atlas/validation";
import { ValidationError } from "@atlas/errors";
import { UserId, Email, PasswordHash } from "./value-objects.js";
import { UserStatus, isValidUserStatus } from "./user-status.js";
import { Profile, type ProfileParams } from "./profile.js";
import {
  createUserPreferences,
  type UserPreferences,
  type UserPreferencesParams,
} from "./preferences.js";
import { createAuditFields, touchAuditFields } from "./audit-fields.js";
import type { AuditFields } from "./audit-fields.js";

export interface CreateUserParams {
  readonly id: string;
  readonly email: string;
  readonly passwordHash: string;
  readonly displayName: string;
  readonly status: string | undefined;
  readonly profile: ProfileParams | undefined;
  readonly preferences: UserPreferencesParams | undefined;
}

export class User {
  private readonly _id: UserId;
  private readonly _email: Email;
  private _passwordHash: PasswordHash;
  private _status: UserStatus;
  private _profile: Profile;
  private _preferences: UserPreferences;
  private _audit: AuditFields;

  private constructor(
    id: UserId,
    email: Email,
    passwordHash: PasswordHash,
    status: UserStatus,
    profile: Profile,
    preferences: UserPreferences,
    audit: AuditFields,
  ) {
    this._id = id;
    this._email = email;
    this._passwordHash = passwordHash;
    this._status = status;
    this._profile = profile;
    this._preferences = preferences;
    this._audit = audit;
  }

  public get id(): UserId {
    return this._id;
  }

  public get email(): Email {
    return this._email;
  }

  public get passwordHash(): PasswordHash {
    return this._passwordHash;
  }

  public get displayName(): string {
    return this._profile.displayName;
  }

  public get status(): UserStatus {
    return this._status;
  }

  public get profile(): Profile {
    return this._profile;
  }

  public get preferences(): UserPreferences {
    return this._preferences;
  }

  public get audit(): AuditFields {
    return this._audit;
  }

  public static create(params: CreateUserParams): User {
    const id = UserId.create(params.id);
    const email = Email.create(params.email);
    const passwordHash = PasswordHash.create(params.passwordHash);
    const displayName = params.displayName.trim();

    assertNonEmptyString(displayName, "displayName");

    const status =
      params.status !== undefined && isValidUserStatus(params.status)
        ? params.status
        : UserStatus.Active;

    const profile = Profile.create({
      displayName,
      avatarUrl: params.profile?.avatarUrl,
      bio: params.profile?.bio,
      timezone: params.profile?.timezone,
    });

    const preferences = createUserPreferences(params.preferences);
    const audit = createAuditFields();

    return new User(id, email, passwordHash, status, profile, preferences, audit);
  }

  public updateDisplayName(newName: string): void {
    const trimmed = newName.trim();
    assertNonEmptyString(trimmed, "displayName");

    if (trimmed === this._profile.displayName) {
      return;
    }

    this._profile = this._profile.update({ displayName: trimmed });
    this._audit = touchAuditFields(this._audit);
  }

  public changePassword(newPasswordHash: PasswordHash): void {
    if (this._passwordHash.equals(newPasswordHash)) {
      throw new ValidationError("New password must differ from current password");
    }

    this._passwordHash = newPasswordHash;
    this._audit = touchAuditFields(this._audit);
  }

  public suspend(): void {
    if (this._status === UserStatus.Suspended) {
      throw new ValidationError("User is already suspended");
    }

    if (this._status === UserStatus.Deleted) {
      throw new ValidationError("Cannot suspend a deleted user");
    }

    this._status = UserStatus.Suspended;
    this._audit = touchAuditFields(this._audit);
  }

  public activate(): void {
    if (this._status === UserStatus.Active) {
      return;
    }

    if (this._status === UserStatus.Deleted) {
      throw new ValidationError("Cannot activate a deleted user");
    }

    this._status = UserStatus.Active;
    this._audit = touchAuditFields(this._audit);
  }

  public markDeleted(): void {
    if (this._status === UserStatus.Deleted) {
      return;
    }

    this._status = UserStatus.Deleted;
    this._audit = touchAuditFields(this._audit);
  }

  public updateProfile(changes: Partial<ProfileParams>): void {
    this._profile = this._profile.update(changes);
    this._audit = touchAuditFields(this._audit);
  }

  public updatePreferences(params: Partial<UserPreferencesParams>): void {
    this._preferences = createUserPreferences({ ...this._preferences, ...params });
    this._audit = touchAuditFields(this._audit);
  }
}
