import { ApiProperty } from "@nestjs/swagger";

class ActivityActorDto {
  @ApiProperty({ description: "Actor user ID", format: "uuid" })
  public readonly id!: string;

  @ApiProperty({ description: "Actor display name", example: "Jane Doe" })
  public readonly displayName!: string;
}

export class ActivityEntryDto {
  @ApiProperty({ description: "Activity entry ID", format: "uuid" })
  public readonly id!: string;

  @ApiProperty({ description: "Activity type", example: "CREATED" })
  public readonly type!: string;

  @ApiProperty({ description: "Activity actor", type: ActivityActorDto })
  public readonly actor!: ActivityActorDto;

  @ApiProperty({ description: "Activity description", example: 'Project "Q4 Campaign" created' })
  public readonly description!: string;

  @ApiProperty({ description: "Date the activity occurred", example: "2025-01-01T00:00:00.000Z" })
  public readonly createdAt!: Date;

  private constructor(data: ActivityEntryDto) {
    this.id = data.id;
    this.type = data.type;
    this.actor = data.actor;
    this.description = data.description;
    this.createdAt = data.createdAt;
  }

  public static from(log: {
    id: string;
    type: string;
    actorId: string;
    description: string;
    createdAt: Date;
    actorDisplayName: string;
  }): ActivityEntryDto {
    return new ActivityEntryDto({
      id: log.id,
      type: log.type,
      actor: { id: log.actorId, displayName: log.actorDisplayName },
      description: log.description,
      createdAt: log.createdAt,
    });
  }
}
