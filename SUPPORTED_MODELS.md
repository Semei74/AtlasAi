# Atlas AI

# Supported Models

**Version:** 1.0.0  
**Status:** Active  
**Document Type:** AI Model & Provider Support Specification  
**Owner:** AI Platform Team  
**Last Updated:** 2026-06-29

---

# 1. Purpose

This document defines the AI providers, model categories, capabilities, and compatibility
requirements supported by the Atlas AI platform.

Atlas AI is designed with a provider-independent architecture, allowing multiple AI services to be
integrated through a unified AI Gateway.

The objectives of this document are to:

- Define officially supported AI providers.
- Describe supported model capabilities.
- Standardize provider integration.
- Ensure portability between providers.
- Minimize vendor lock-in.
- Support future model expansion.

---

# 2. AI Provider Architecture

Atlas AI never communicates directly with providers from client applications.

All requests pass through the AI Gateway.

```text
Client
   │
   ▼
AI Gateway
   │
   ├── Model Router
   ├── Prompt Manager
   ├── Context Engine
   ├── Cost Manager
   ├── Security Layer
   ├── Audit Logger
   ▼
Provider Adapter
   │
   ▼
AI Provider
```

The AI Gateway abstracts provider-specific APIs and exposes a consistent internal interface.

---

# 3. Supported AI Providers

Atlas AI currently supports or is designed to support the following providers:

| Provider                     | Status    |
| ---------------------------- | --------- |
| OpenAI                       | Supported |
| Anthropic                    | Supported |
| Google AI                    | Supported |
| Azure OpenAI                 | Supported |
| Ollama                       | Supported |
| Local OpenAI-Compatible APIs | Supported |
| Self-Hosted Models           | Supported |

Additional providers may be added through the plugin architecture.

---

# 4. Supported Model Categories

Atlas AI supports multiple classes of AI models.

## Chat Models

Used for:

- Conversations
- Assistants
- Agents
- Question Answering
- Business Automation

---

## Reasoning Models

Optimized for:

- Complex analysis
- Multi-step reasoning
- Planning
- Decision support

---

## Embedding Models

Used for:

- Vector Search
- Semantic Search
- RAG
- Similarity Matching
- Knowledge Retrieval

---

## Vision Models

Used for:

- Image Understanding
- OCR
- Object Detection
- Document Analysis
- Screenshot Interpretation

---

## Speech Models

Used for:

- Speech Recognition
- Text-to-Speech
- Voice Assistants
- Audio Transcription

---

## Image Generation Models

Used for:

- Image Creation
- Design Assistance
- Marketing Assets
- Concept Visualization

---

---

# 5. Capability Matrix

| Capability          |  Chat   | Reasoning | Embedding | Vision  | Speech | Image Generation |
| ------------------- | :-----: | :-------: | :-------: | :-----: | :----: | :--------------: |
| Conversational AI   |   ✅    |    ✅     |    ❌     |   ❌    |   ❌   |        ❌        |
| Tool Calling        |   ✅    |    ✅     |    ❌     | Limited |   ❌   |        ❌        |
| Structured Output   |   ✅    |    ✅     |    ❌     | Limited |   ❌   |        ❌        |
| Streaming           |   ✅    |    ✅     |    ❌     | Limited |   ✅   |     Limited      |
| Long Context        |   ✅    |    ✅     |    ❌     | Limited |   ❌   |        ❌        |
| Function Calling    |   ✅    |    ✅     |    ❌     | Limited |   ❌   |        ❌        |
| Embeddings          |   ❌    |    ❌     |    ✅     |   ❌    |   ❌   |        ❌        |
| Image Understanding | Limited |  Limited  |    ❌     |   ✅    |   ❌   |        ❌        |
| Audio Processing    |   ❌    |    ❌     |    ❌     |   ❌    |   ✅   |        ❌        |
| Image Generation    |   ❌    |    ❌     |    ❌     |   ❌    |   ❌   |        ✅        |

---

# 6. Context Window Support

Atlas AI supports models with varying context window sizes.

Typical categories include:

| Context Size | Typical Usage                  |
| ------------ | ------------------------------ |
| Small        | Simple chat interactions       |
| Medium       | Business assistants            |
| Large        | Document analysis              |
| Very Large   | Enterprise knowledge retrieval |
| Extended     | Multi-document reasoning       |

The AI Gateway automatically selects models with an appropriate context capacity for each request.

---

# 7. Function & Tool Calling

Atlas AI supports providers capable of invoking external tools.

Supported capabilities include:

- Function Calling
- Tool Calling
- Workflow Invocation
- Plugin Execution
- API Integration
- Database Operations
- Knowledge Retrieval

Tool execution is governed by security policies and runtime authorization.

---

# 8. Structured Output

Where supported by the provider, Atlas AI can request structured responses.

Supported formats include:

- JSON
- JSON Schema
- Typed Objects
- Markdown
- Plain Text

Structured outputs improve integration reliability and reduce parsing complexity.

---

# 9. Streaming Support

Streaming responses may be enabled for compatible providers.

Benefits include:

- Lower perceived latency
- Improved user experience
- Progressive rendering
- Real-time interaction

Streaming behavior is configurable per provider and per request.

---

---

# 10. Embedding Support

Atlas AI supports embedding models for semantic understanding and enterprise knowledge retrieval.

Supported capabilities include:

- Semantic Embeddings
- Vector Indexing
- Similarity Search
- Hybrid Search
- Document Clustering
- Knowledge Graph Integration
- Retrieval-Augmented Generation (RAG)

Embedding models should be interchangeable through the AI Gateway abstraction layer.

---

# 11. RAG Compatibility

All supported embedding providers should integrate with the Atlas AI Knowledge Platform.

Supported RAG features include:

- Document Chunking
- Metadata Extraction
- Embedding Generation
- Vector Search
- Hybrid Search
- Context Assembly
- Citation Generation
- Tenant-Aware Retrieval
- Permission Filtering

The AI Gateway coordinates retrieval operations through the Context Engine before invoking language
models.

---

# 12. Model Routing Strategy

Atlas AI dynamically selects models based on request characteristics.

Routing factors may include:

- Task type
- Required capabilities
- Context size
- Response latency
- Provider availability
- Cost limits
- Tenant configuration
- Security policies
- Geographic deployment requirements

Model routing decisions remain transparent to client applications.

---

# 13. Multi-Provider Failover

To improve reliability, Atlas AI supports automatic provider failover.

Failover conditions may include:

- Provider outage
- Rate limiting
- Timeout
- Capacity limits
- Regional availability
- Temporary maintenance

Fallback providers shall support equivalent capabilities whenever possible.

---

# 14. Cost Optimization

The AI Gateway includes cost-aware routing policies.

Optimization strategies include:

- Selecting the lowest-cost compatible model
- Prioritizing local models where appropriate
- Reusing cached responses
- Minimizing unnecessary token usage
- Efficient context assembly
- Adaptive routing based on workload

Cost optimization must not compromise required functionality, security, or response quality.

---

# 15. Model Selection Guidelines

When multiple models satisfy a request, the preferred model should be selected according to:

1. Functional compatibility
2. Security requirements
3. Accuracy
4. Latency
5. Context capacity
6. Cost efficiency
7. Provider availability

Selection policies may be customized at the organization or workspace level.

---

---

# 16. Deprecation Policy

Atlas AI maintains backward compatibility whenever practical while allowing continuous platform
evolution.

### Deprecation Principles

- Deprecated providers shall remain supported for a defined transition period.
- Breaking changes shall be documented in advance.
- Migration guidance shall accompany deprecated functionality.
- Provider-specific features should not affect the public platform APIs.

Deprecated models may continue to operate in compatibility mode until their official retirement.

---

# 17. Adding New Providers

New AI providers should integrate through the Provider Adapter interface.

Every provider implementation should support, where applicable:

- Authentication
- Chat Completion
- Streaming
- Function / Tool Calling
- Structured Output
- Embeddings
- Vision
- Usage Metrics
- Error Handling
- Rate Limiting
- Health Checks

Provider-specific behavior should remain encapsulated within the adapter layer.

---

# 18. Version Compatibility

Atlas AI follows semantic versioning for provider integrations.

Compatibility expectations:

| Component         | Versioning Policy       |
| ----------------- | ----------------------- |
| AI Gateway        | Semantic Versioning     |
| Provider Adapters | Independent Versioning  |
| Prompt Library    | Version Controlled      |
| Context Engine    | Backward Compatible     |
| Plugin API        | Stable Public Interface |

Major compatibility changes shall be documented through Architecture Decision Records (ADRs) and the
project changelog.

---

# 19. Related Documentation

| Document                  | Purpose                            |
| ------------------------- | ---------------------------------- |
| README.md                 | Project overview                   |
| ROADMAP.md                | Development roadmap                |
| ARCHITECTURE_DECISIONS.md | Architecture Decision Records      |
| CHANGELOG.md              | Project history                    |
| SECURITY.md               | Security policies                  |
| CONTRIBUTING.md           | Development workflow               |
| docs/ai/                  | AI platform architecture           |
| docs/rag/                 | Knowledge & retrieval architecture |

---

# 20. Summary

Atlas AI is designed around a provider-agnostic AI architecture that enables seamless integration
with multiple language model providers while maintaining a consistent internal interface.

The AI Gateway, Context Engine, and Provider Adapter architecture ensure:

- Vendor independence
- Enterprise scalability
- Secure model access
- Cost-aware routing
- High availability through multi-provider failover
- Consistent support for chat, reasoning, embeddings, vision, speech, and image generation
  capabilities

This document defines the baseline compatibility requirements for AI providers and models supported
by Atlas AI and shall evolve alongside the platform as new providers, capabilities, and standards
emerge.

---
