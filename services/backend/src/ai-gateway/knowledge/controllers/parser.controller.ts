import {
  Controller,
  Get,
  Post,
  Param,
  Req,
  UseGuards,
  HttpCode,
  Inject,
  ParseUUIDPipe,
  BadRequestException,
  NotFoundException,
} from "@nestjs/common";
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from "@nestjs/swagger";
import { AuthGuard } from "../../../auth/authorization/guards/auth.guard.js";
import type { RequestWithUser } from "../../../auth/authorization/guards/auth.guard.js";
import { PARSER_SERVICE } from "../interfaces/parser-service.interface.js";
import type { ParserService } from "../interfaces/parser-service.interface.js";

@ApiTags("Knowledge Document Parsing")
@Controller("api/v1/knowledge/documents/:id/parse")
export class ParserController {
  public constructor(
    @Inject(PARSER_SERVICE)
    private readonly parserService: ParserService,
  ) {}

  @Post("process")
  @UseGuards(AuthGuard)
  @HttpCode(200)
  @ApiBearerAuth()
  @ApiOperation({ summary: "Parse a document into structured content" })
  @ApiResponse({ status: 200, description: "Parsing completed" })
  @ApiResponse({ status: 404, description: "Document not found" })
  public async parseDocument(
    @Param("id", ParseUUIDPipe) id: string,
    @Req() request: RequestWithUser,
  ): Promise<unknown> {
    const user = request.user;
    if (user === undefined) throw new BadRequestException("User not authenticated");

    return this.parserService.parseDocument(id, user.organizationId ?? "");
  }

  @Get()
  @UseGuards(AuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: "Get parse result for a document" })
  @ApiResponse({ status: 200, description: "Parse result returned" })
  @ApiResponse({ status: 404, description: "Parse result not found" })
  public async getParseResult(
    @Param("id", ParseUUIDPipe) id: string,
    @Req() request: RequestWithUser,
  ): Promise<unknown> {
    const user = request.user;
    if (user === undefined) throw new BadRequestException("User not authenticated");

    const result = await this.parserService.getParseResult(id, user.organizationId ?? "");
    if (result === null) throw new NotFoundException("Parse result not found");

    return result;
  }
}
