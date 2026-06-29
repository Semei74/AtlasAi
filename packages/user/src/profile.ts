import { assertNonEmptyString } from "@atlas/validation";
import { isUrl } from "@atlas/validation";

const ALLOWED_TIMEZONES: ReadonlySet<string> = new Set([
  "UTC",
  "America/New_York",
  "America/Chicago",
  "America/Denver",
  "America/Los_Angeles",
  "Europe/London",
  "Europe/Paris",
  "Europe/Berlin",
  "Europe/Moscow",
  "Asia/Tokyo",
  "Asia/Shanghai",
  "Asia/Kolkata",
  "Australia/Sydney",
  "Pacific/Auckland",
]);

export type Timezone = string;

export interface ProfileParams {
  readonly displayName: string;
  readonly avatarUrl?: string | undefined;
  readonly bio?: string | undefined;
  readonly timezone?: string | undefined;
}

export class Profile {
  private constructor(
    public readonly displayName: string,
    public readonly avatarUrl: string | undefined,
    public readonly bio: string | undefined,
    public readonly timezone: string | undefined,
  ) {}

  public static create(params: ProfileParams): Profile {
    assertNonEmptyString(params.displayName, "displayName");

    if (params.avatarUrl !== undefined && !isUrl(params.avatarUrl)) {
      throw new Error("Invalid avatar URL");
    }

    if (params.timezone !== undefined && !ALLOWED_TIMEZONES.has(params.timezone)) {
      throw new Error(`Invalid timezone: '${params.timezone}'`);
    }

    return new Profile(
      params.displayName.trim(),
      params.avatarUrl,
      params.bio?.trim(),
      params.timezone,
    );
  }

  public update(changes: Partial<ProfileParams>): Profile {
    return Profile.create({
      displayName: changes.displayName ?? this.displayName,
      avatarUrl: changes.avatarUrl ?? this.avatarUrl,
      bio: changes.bio ?? this.bio,
      timezone: changes.timezone ?? this.timezone,
    });
  }
}
