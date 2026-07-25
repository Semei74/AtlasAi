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
import { OCR_SERVICE } from "../interfaces/ocr-service.interface.js";
import type { OcrService } from "../interfaces/ocr-service.interface.js";

@ApiTags("Knowledge Document OCR")
@Controller("api/v1/knowledge/documents/:id/ocr")
export class OcrController {
  public constructor(
    @Inject(OCR_SERVICE)
    private readonly ocrService: OcrService,
  ) {}

  @Post("process")
  @UseGuards(AuthGuard)
  @HttpCode(200)
  @ApiBearerAuth()
  @ApiOperation({ summary: "Run OCR on a document" })
  @ApiResponse({ status: 200, description: "OCR completed" })
  @ApiResponse({ status: 404, description: "Document not found" })
  public async processDocument(
    @Param("id", ParseUUIDPipe) id: string,
    @Req() request: RequestWithUser,
  ): Promise<unknown> {
    const user = request.user;
    if (user === undefined) throw new BadRequestException("User not authenticated");

    return this.ocrService.processDocument(id, user.organizationId ?? "");
  }

  @Get()
  @UseGuards(AuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: "Get OCR result for a document" })
  @ApiResponse({ status: 200, description: "OCR result returned" })
  @ApiResponse({ status: 404, description: "OCR result not found" })
  public async getOcrResult(
    @Param("id", ParseUUIDPipe) id: string,
    @Req() request: RequestWithUser,
  ): Promise<unknown> {
    const user = request.user;
    if (user === undefined) throw new BadRequestException("User not authenticated");

    const result = await this.ocrService.getOcrResult(id, user.organizationId ?? "");
    if (result === null) throw new NotFoundException("OCR result not found");

    return result;
  }
}
