export interface UserRecord {
  readonly id: string;
  readonly email: string;
  readonly passwordHash: string;
  readonly displayName: string;
  readonly status: string;
  readonly avatarUrl: string | null;
  readonly bio: string | null;
  readonly timezone: string | null;
  readonly theme: string;
  readonly locale: string;
  readonly emailNotifications: boolean;
  readonly pushNotifications: boolean;
  readonly createdAt: Date;
  readonly updatedAt: Date;
}

export interface UserRepository {
  findByEmail(email: string): Promise<UserRecord | null>;
  findById(id: string): Promise<UserRecord | null>;
  create(record: Omit<UserRecord, "createdAt" | "updatedAt">): Promise<UserRecord>;
  update(id: string, changes: Partial<Omit<UserRecord, "id">>): Promise<UserRecord>;
}
