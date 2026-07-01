import {
  Controller,
  Post,
  Body,
  Req,
  UseGuards,
  HttpCode,
  Inject,
  UnauthorizedException,
  Headers,
} from "@nestjs/common";
import type { FastifyRequest } from "fastify";
import { AuthGuard } from "../../auth/authorization/guards/auth.guard.js";
import type { RequestWithUser } from "../../auth/authorization/guards/auth.guard.js";
import { AiGatewayService } from "../services/ai-gateway.service.js";
import { ChatCompletionRequestDto } from "../dto/chat-completion-request.dto.js";
import { ChatCompletionResponseDto } from "../dto/chat-completion-response.dto.js";

@Controller("api/v1/ai")
export class AiGatewayController {
  public constructor(
    @Inject(AiGatewayService) private readonly aiGatewayService: AiGatewayService,
  ) {}

  @Post("chat")
  @UseGuards(AuthGuard)
  @HttpCode(200)
  public async chat(
    @Body() body: ChatCompletionRequestDto,
    @Req() request: FastifyRequest,
    @Headers("x-workspace-id") workspaceId?: string,
  ): Promise<ChatCompletionResponseDto> {
    const user = (request as RequestWithUser).user;

    if (user === undefined) {
      throw new UnauthorizedException();
    }

    const orgId = user.organizationId ?? "";

    const response = await this.aiGatewayService.chat(body, user.sub, orgId, workspaceId ?? "");

    return ChatCompletionResponseDto.from(response);
  }
}
