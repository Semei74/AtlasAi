import {
  Controller,
  Post,
  Sse,
  Body,
  Req,
  UseGuards,
  HttpCode,
  Inject,
  UnauthorizedException,
  Headers,
  MessageEvent,
} from "@nestjs/common";
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from "@nestjs/swagger";
import { Throttle, seconds } from "@nestjs/throttler";
import type { FastifyRequest } from "fastify";
import { Observable } from "rxjs";
import { AuthGuard } from "../../auth/authorization/guards/auth.guard.js";
import type { RequestWithUser } from "../../auth/authorization/guards/auth.guard.js";
import { AiGatewayService } from "../services/ai-gateway.service.js";
import { ChatCompletionRequestDto } from "../dto/chat-completion-request.dto.js";
import { ChatCompletionResponseDto } from "../dto/chat-completion-response.dto.js";

@ApiTags("AI Gateway")
@Controller("api/v1/ai")
export class AiGatewayController {
  public constructor(
    @Inject(AiGatewayService) private readonly aiGatewayService: AiGatewayService,
  ) {}

  @Post("chat")
  @UseGuards(AuthGuard)
  @HttpCode(200)
  @Throttle({ default: { limit: 30, ttl: seconds(60), blockDuration: seconds(60) } })
  @ApiBearerAuth()
  @ApiOperation({ summary: "Send a chat completion request" })
  @ApiResponse({ status: 200, description: "Chat completion response", type: ChatCompletionResponseDto })
  @ApiResponse({ status: 401, description: "Unauthorized" })
  @ApiResponse({ status: 422, description: "Validation error" })
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

  @Post("chat/stream")
  @UseGuards(AuthGuard)
  @HttpCode(200)
  @Throttle({ default: { limit: 15, ttl: seconds(60), blockDuration: seconds(60) } })
  @ApiBearerAuth()
  @ApiOperation({ summary: "Stream a chat completion response via SSE" })
  @ApiResponse({ status: 200, description: "SSE stream of chat completion chunks" })
  @ApiResponse({ status: 401, description: "Unauthorized" })
  @ApiResponse({ status: 422, description: "Validation error" })
  @Sse()
  public chatStream(
    @Body() body: ChatCompletionRequestDto,
    @Req() request: FastifyRequest,
    @Headers("x-workspace-id") workspaceId?: string,
  ): Observable<MessageEvent> {
    const user = (request as RequestWithUser).user;

    if (user === undefined) {
      throw new UnauthorizedException();
    }

    const orgId = user.organizationId ?? "";

    return this.aiGatewayService.chatStream(body, user.sub, orgId, workspaceId ?? "");
  }
}
