import { describe, it, expect, vi } from "vitest";
import { UnauthorizedException, ForbiddenException } from "@nestjs/common";
import type { FastifyRequest } from "fastify";
import { AiGatewayController } from "./ai-gateway.controller.js";
import type { AiGatewayService } from "../services/ai-gateway.service.js";
import type { GatewayResponse } from "../interfaces/ai-gateway.interface.js";
import type { ChatCompletionRequestDto } from "../dto/chat-completion-request.dto.js";

const mockGatewayResponse: GatewayResponse = {
  id: "test-id",
  model: "gpt-4",
  provider: "stub",
  content: "Test response",
  finishReason: "stop",
  usage: {
    promptTokens: 10,
    completionTokens: 20,
    totalTokens: 30,
    estimatedCost: 0.001,
  },
  latency: 100,
};

describe("AiGatewayController", () => {
  const mockChat = vi.fn();
  const service = { chat: mockChat } as unknown as AiGatewayService;
  const controller = new AiGatewayController(service);

  const testRequest = {} as unknown as FastifyRequest;
  const testRequestWithUser = {
    user: { sub: "user-1", organizationId: "org-1" },
  } as unknown as FastifyRequest;

  const testBody = {
    model: "gpt-4",
    messages: [{ role: "user", content: "Hello" }],
  } as ChatCompletionRequestDto;

  describe("chat", () => {
    it("should return a ChatCompletionResponseDto", async () => {
      mockChat.mockResolvedValueOnce(mockGatewayResponse);

      const result = await controller.chat(testBody, testRequestWithUser, "ws-1");

      expect(result).toBeInstanceOf(Object);
      expect(result).toHaveProperty("id", "test-id");
      expect(result).toHaveProperty("model", "gpt-4");
      expect(result).toHaveProperty("provider", "stub");
      expect(result).toHaveProperty("content", "Test response");
      expect(result).toHaveProperty("finishReason", "stop");
      expect(result).toHaveProperty("usage");
      expect(result).toHaveProperty("latency", 100);
    });

    it("should call service with correct arguments", async () => {
      mockChat.mockResolvedValueOnce(mockGatewayResponse);

      await controller.chat(testBody, testRequestWithUser, "ws-1");

      expect(mockChat).toHaveBeenCalledWith(testBody, "user-1", "org-1", "ws-1");
    });

    it("should pass empty string for orgId when organizationId is null", async () => {
      const requestWithNullOrg = {
        user: { sub: "user-1", organizationId: null },
      } as unknown as FastifyRequest;

      mockChat.mockResolvedValueOnce(mockGatewayResponse);

      await controller.chat(testBody, requestWithNullOrg, undefined);

      expect(mockChat).toHaveBeenCalledWith(testBody, "user-1", "", "");
    });

    it("should throw UnauthorizedException when no user on request", async () => {
      await expect(controller.chat(testBody, testRequest, undefined)).rejects.toThrow(
        UnauthorizedException,
      );
    });

    it("should propagate service errors", async () => {
      const serviceError = new ForbiddenException("Model not allowed");
      mockChat.mockRejectedValueOnce(serviceError);

      await expect(controller.chat(testBody, testRequestWithUser, "ws-1")).rejects.toThrow(
        ForbiddenException,
      );
    });
  });
});
