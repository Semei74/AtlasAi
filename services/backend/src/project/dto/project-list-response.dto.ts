import { ApiProperty } from "@nestjs/swagger";
import { ProjectResponseDto } from "./project-response.dto.js";

export class ProjectListResponseDto {
  @ApiProperty({ description: "List of projects", type: [ProjectResponseDto] })
  public readonly items!: ProjectResponseDto[];

  @ApiProperty({ description: "Total number of projects matching the filter", example: 42 })
  public readonly total!: number;

  @ApiProperty({ description: "Current page number", example: 1 })
  public readonly page!: number;

  @ApiProperty({ description: "Items per page", example: 20 })
  public readonly limit!: number;

  @ApiProperty({ description: "Total number of pages", example: 3 })
  public readonly totalPages!: number;

  private constructor(data: ProjectListResponseDto) {
    this.items = data.items;
    this.total = data.total;
    this.page = data.page;
    this.limit = data.limit;
    this.totalPages = data.totalPages;
  }

  public static from(data: {
    items: ProjectResponseDto[];
    total: number;
    page: number;
    limit: number;
  }): ProjectListResponseDto {
    return new ProjectListResponseDto({
      items: data.items,
      total: data.total,
      page: data.page,
      limit: data.limit,
      totalPages: Math.ceil(data.total / data.limit),
    });
  }
}
