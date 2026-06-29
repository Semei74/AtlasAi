import { Injectable } from "@nestjs/common";
import argon2 from "argon2";

@Injectable()
export class PasswordHashingService {
  public async hash(password: string): Promise<string> {
    return argon2.hash(password, { type: argon2.argon2id });
  }

  public async verify(hash: string, password: string): Promise<boolean> {
    return argon2.verify(hash, password);
  }
}
