import { describe, it, expect } from "vitest";
import { DefaultToolRegistry } from "./default-tool-registry.js";
import { DefaultToolCallingEngine } from "./default-tool-calling-engine.js";
import { validateToolArguments } from "./schema/tool-schema-validator.js";
import type { ToolDefinition } from "../providers/interfaces/tool-executor.interface.js";

const CALC_SCHEMA = {
  type: "object",
  properties: {
    a: { type: "number" },
    b: { type: "number" },
    op: { type: "string", enum: ["add", "sub"] },
  },
  required: ["a", "b", "op"],
} as const;

function calcDefinition(overrides: Partial<ToolDefinition> = {}): ToolDefinition {
  return {
    name: "calculator",
    description: "Adds or subtracts two numbers",
    type: "function",
    inputSchema: CALC_SCHEMA,
    enabled: true,
    ...overrides,
  };
}

function createEngine(): { registry: DefaultToolRegistry; engine: DefaultToolCallingEngine } {
  const registry = new DefaultToolRegistry();
  registry.register(
    calcDefinition(),
    (args) => {
      const a = args["a"] as number;
      const b = args["b"] as number;
      const op = args["op"] as string;
      return Promise.resolve(op === "add" ? a + b : a - b);
    },
  );
  return { registry, engine: new DefaultToolCallingEngine(registry) };
}

describe("validateToolArguments", () => {
  it("accepts args matching the schema", () => {
    expect(validateToolArguments(CALC_SCHEMA as unknown as Record<string, unknown>, { a: 1, b: 2, op: "add" })).toEqual({ valid: true });
  });

  it("rejects missing required properties", () => {
    const result = validateToolArguments(CALC_SCHEMA, { a: 1 });
    expect(result.valid).toBe(false);
    expect(result.error).toContain("Missing required property");
  });

  it("rejects wrong types", () => {
    const result = validateToolArguments(CALC_SCHEMA, { a: "x", b: 2, op: "add" });
    expect(result.valid).toBe(false);
    expect(result.error).toContain("Invalid type");
  });

  it("rejects values outside the enum", () => {
    const result = validateToolArguments(CALC_SCHEMA, { a: 1, b: 2, op: "mul" });
    expect(result.valid).toBe(false);
    expect(result.error).toContain("must be one of");
  });

  it("accepts when no schema is provided", () => {
    expect(validateToolArguments(undefined, { anything: true })).toEqual({ valid: true });
  });
});

describe("DefaultToolCallingEngine", () => {
  it("executes a registered tool and returns its output", async () => {
    const { engine } = createEngine();
    const result = await engine.execute({ id: "c1", toolName: "calculator", arguments: { a: 2, b: 3, op: "add" } });
    expect(result.success).toBe(true);
    expect(result.output).toBe(5);
    expect(result.errorMessage).toBeNull();
    expect(result.durationMs).toBeGreaterThanOrEqual(0);
  });

  it("fails for an unknown tool", async () => {
    const { engine } = createEngine();
    const result = await engine.execute({ id: "c2", toolName: "missing", arguments: {} });
    expect(result.success).toBe(false);
    expect(result.errorMessage).toContain("Unknown tool");
  });

  it("fails for a disabled tool", async () => {
    const registry = new DefaultToolRegistry();
    registry.register(calcDefinition({ enabled: false }), () => Promise.resolve(0));
    const engine = new DefaultToolCallingEngine(registry);
    const result = await engine.execute({ id: "c3", toolName: "calculator", arguments: { a: 1, b: 1, op: "add" } });
    expect(result.success).toBe(false);
    expect(result.errorMessage).toContain("disabled");
  });

  it("fails when arguments are invalid", async () => {
    const { engine } = createEngine();
    const result = await engine.execute({ id: "c4", toolName: "calculator", arguments: { a: 1 } });
    expect(result.success).toBe(false);
    expect(result.errorMessage).toContain("Missing required property");
  });

  it("captures handler errors with the message", async () => {
    const registry = new DefaultToolRegistry();
    registry.register(calcDefinition(), () => Promise.reject(new Error("boom")));
    const engine = new DefaultToolCallingEngine(registry);
    const result = await engine.execute({ id: "c5", toolName: "calculator", arguments: { a: 1, b: 1, op: "add" } });
    expect(result.success).toBe(false);
    expect(result.errorMessage).toBe("boom");
  });

  it("executes a batch of calls", async () => {
    const { engine } = createEngine();
    const results = await engine.executeBatch([
      { id: "b1", toolName: "calculator", arguments: { a: 2, b: 3, op: "add" } },
      { id: "b2", toolName: "calculator", arguments: { a: 9, b: 4, op: "sub" } },
    ]);
    expect(results).toHaveLength(2);
    expect(results[0]?.output).toBe(5);
    expect(results[1]?.output).toBe(5);
  });

  it("lists registered tool definitions", async () => {
    const { engine } = createEngine();
    const tools = await engine.listTools();
    expect(tools).toHaveLength(1);
    expect(tools[0]?.name).toBe("calculator");
  });

  it("validates a tool by name", () => {
    const { engine } = createEngine();
    expect(engine.validate("calculator", { a: 1, b: 2, op: "add" }).valid).toBe(true);
    expect(engine.validate("calculator", { a: 1 }).valid).toBe(false);
    expect(engine.validate("unknown", {}).valid).toBe(false);
  });

  it("formats successful and failed results for injection", async () => {
    const { engine } = createEngine();
    const ok = await engine.execute({ id: "f1", toolName: "calculator", arguments: { a: 1, b: 2, op: "add" } });
    const bad = await engine.execute({ id: "f2", toolName: "calculator", arguments: {} });
    expect(engine.formatResult(ok)).toBe("Tool result [f1]: 3");
    expect(engine.formatResult(bad)).toContain("Tool error [f2]");
  });
});
