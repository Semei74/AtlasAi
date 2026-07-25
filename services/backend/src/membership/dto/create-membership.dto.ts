import { IsString, IsEnum } from "class-validator";
import { ApiProperty } from "@nestjs/swagger";
import { MembershipRole } from "../interfaces/membership-role.enum.js";

export class CreateMembershipDto {
  @ApiProperty({ description: "User ID", format: "uuid" })
  @IsString()
  public readonly userId!: string;

  @ApiProperty({ description: "Membership role", enum: MembershipRole, example: "member" })
  @IsEnum(MembershipRole)
  public readonly role!: MembershipRole;
}
