# Atlas AI

# AI Models Specification

**Version:** 1.0.0  
**Status:** Approved  
**Document Type:** AI Models Specification  
**Priority:** Critical  
**Owner:** AI Platform Team  
**Last Updated:** 2026-06-29

---

# 1. Purpose

This document defines the AI model architecture used throughout Atlas AI.

The platform is designed to be model-agnostic and support multiple AI providers through a unified
abstraction layer. No application component should depend directly on a single AI vendor.

---

# 2. Objectives

The AI Models subsystem shall provide:

- Multi-provider support
- Unified API
- Automatic model routing
- High availability
- Cost optimization
- Model fallback
- Version control
- Future extensibility

---

# 3. Supported Providers

The platform should support providers including:

- OpenAI
- Anthropic
- Google
- Mistral AI
- xAI
- DeepSeek
- OpenRouter
- Ollama
- LM Studio
- Azure OpenAI
- AWS Bedrock
- Together AI

New providers must be added without modifying business logic.

---

# 4. Model Categories

Supported model types include:

### Large Language Models (LLMs)

- General conversation
- Coding
- Reasoning
- Writing
- Planning

### Vision Models

- Image understanding
- OCR enhancement
- Document analysis

### Embedding Models

- Semantic search
- RAG
- Memory Engine

### Speech Models

- Speech-to-Text
- Text-to-Speech

Future model categories may be added.

---

# 5. Architecture

```
Application
      │
      ▼
AI Orchestrator
      │
      ▼
Model Router
      │
 ┌────┼───────────────┐
 ▼    ▼               ▼
OpenAI Anthropic  Google
 ▼
Other Providers
```

All providers must implement a common interface.

---

# 6. Model Selection

Model selection depends on:

- Task type
- Subscription plan
- Cost
- Availability
- Latency
- Token limits
- User preferences
- Enterprise policies

Routing decisions must be configurable.

---

# 7. Provider Abstraction

Every provider implementation shall expose:

- Chat Completion
- Streaming
- Embeddings
- Vision
- Function Calling
- Tool Calling
- Health Status
- Token Usage

The application must never call provider SDKs directly.

---

# 8. Model Metadata

Every model record should contain:

- Provider
- Model Name
- Version
- Context Window
- Maximum Output Tokens
- Pricing
- Supported Features
- Availability Status

Metadata should be refreshable without deployment.

---

# 9. Fallback Strategy

If a provider becomes unavailable:

1. Retry request
2. Select compatible backup model
3. Preserve conversation context
4. Log routing decision
5. Notify monitoring system

Fallback must occur automatically whenever possible.

---

# 10. Context Windows

The system shall support models with different context sizes.

Examples:

- 8K
- 32K
- 128K
- 200K+
- 1M+ tokens

The orchestrator must automatically adapt requests.

---

# 11. Streaming Support

Streaming responses shall support:

- Partial tokens
- Cancellation
- Progress events
- Error recovery

Streaming behavior must be consistent across providers.

---

# 12. Function & Tool Calling

Supported capabilities include:

- Function Calling
- MCP Tool Invocation
- Structured Outputs
- JSON Mode

Provider-specific implementations must remain hidden behind the abstraction layer.

---

# 13. Performance Targets

Provider selection:

< 20 ms

Routing:

< 10 ms

Streaming startup:

< 500 ms

Health check:

< 100 ms

---

# 14. Monitoring

Track:

- Requests per provider
- Success rate
- Latency
- Token consumption
- Error rate
- Fallback frequency
- Model availability
- Cost per provider

---

# 15. Security

The AI subsystem must:

- Encrypt API credentials
- Isolate provider configurations
- Rotate secrets securely
- Log requests without exposing prompts containing sensitive information
- Respect workspace permissions

---

# 16. Testing

Required tests:

- Provider abstraction
- Model routing
- Streaming
- Tool calling
- Vision requests
- Embedding generation
- Provider failover
- Performance benchmarks

---

# 17. Acceptance Criteria

The AI Models subsystem is accepted only if:

- multiple providers are supported;
- provider abstraction is complete;
- automatic fallback functions correctly;
- monitoring is operational;
- security requirements are met;
- automated tests pass.

---

# 18. Definition of Done

The AI Models subsystem is complete when:

- documented;
- provider-independent;
- integrated with the AI Orchestrator;
- monitored;
- tested;
- scalable;
- production ready.

---

# 19. OpenCode Instructions

OpenCode MUST:

- implement all AI providers through a unified interface;
- avoid direct provider dependencies in business logic;
- support configurable model routing;
- implement automatic provider fallback;
- expose model metadata and health information;
- support streaming, embeddings, vision, and tool calling;
- collect operational metrics;
- reject implementations that violate this specification.

This document is mandatory for every AI model integrated into Atlas AI.
