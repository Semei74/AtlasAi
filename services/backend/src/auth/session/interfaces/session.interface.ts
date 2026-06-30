import type { DeviceInfo } from "./device-info.interface.js";

export interface Session {
  readonly id: string;
  readonly userId: string;
  readonly deviceInfo: DeviceInfo;
  readonly ipAddress: string;
  readonly refreshTokenHash: string;
  readonly lastActivityAt: Date;
  readonly createdAt: Date;
  readonly expiresAt: Date;
  readonly revokedAt: Date | null;
}
