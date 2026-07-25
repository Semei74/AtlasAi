import { IsEnum } from "class-validator";
import { ApiProperty } from "@nestjs/swagger";
import { MembershipRole } from "../interfaces/membership-role.enum.js";

export class UpdateMembershipDto {
  @ApiProperty({ description: "New membership role", enum: MembershipRole, example: "admin" })
  @IsEnum(MembershipRole)
  public readonly role!: MembershipRole;
}
