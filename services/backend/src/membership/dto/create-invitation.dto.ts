import { IsString, IsOptional, IsEmail, IsEnum } from "class-validator";
import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";
import { MembershipRole } from "../interfaces/membership-role.enum.js";

export class CreateInvitationDto {
  @ApiPropertyOptional({ description: "Invitee email address", format: "email", example: "colleague@example.com" })
  @IsOptional()
  @IsEmail()
  public readonly email?: string;

  @ApiPropertyOptional({ description: "Invitee user ID", format: "uuid" })
  @IsOptional()
  @IsString()
  public readonly userId?: string;

  @ApiProperty({ description: "Invited role", enum: MembershipRole, example: "member" })
  @IsEnum(MembershipRole)
  public readonly role!: MembershipRole;
}
