import { ConfigurationError } from "@atlas/errors";

export interface ConfigSource {
  get(key: string): string | undefined;
  has(key: string): boolean;
}

export interface ConfigField {
  readonly type: "string" | "number" | "boolean";
  readonly required?: boolean;
  readonly default?: unknown;
  readonly description?: string;
}

export type ConfigSchema = Record<string, ConfigField>;

const envSource: ConfigSource = {
  get(key: string): string | undefined {
    return process.env[key];
  },
  has(key: string): boolean {
    return key in process.env;
  },
};

export class ConfigLoader {
  private readonly cache = new Map<string, unknown>();
  private readonly source: ConfigSource;
  private loaded = false;

  public constructor(source: ConfigSource = envSource) {
    this.source = source;
  }

  public load(schema: ConfigSchema): Record<string, unknown> {
    if (this.loaded) {
      return this.getCache();
    }

    const config: Record<string, unknown> = {};
    const errors: string[] = [];

    for (const [key, definition] of Object.entries(schema)) {
      const rawValue = this.source.get(key);
      const value = rawValue ?? definition.default;

      if (value === undefined && definition.required) {
        errors.push(`Missing required config key: '${key}'`);
        continue;
      }

      if (value !== undefined) {
        const parsed = this.parseValue(key, value, definition);
        if (parsed !== undefined) {
          config[key] = parsed;
        }
      }
    }

    if (errors.length > 0) {
      throw new ConfigurationError(`Configuration validation failed:\n${errors.join("\n")}`);
    }

    this.cache.clear();
    for (const [key, value] of Object.entries(config)) {
      this.cache.set(key, value);
    }
    this.loaded = true;

    return config;
  }

  // eslint-disable-next-line @typescript-eslint/no-unnecessary-type-parameters
  public get<T>(key: string): T | undefined {
    return this.cache.get(key) as T | undefined;
  }

  // eslint-disable-next-line @typescript-eslint/no-unnecessary-type-parameters
  public require<T>(key: string): T {
    const value = this.get<T>(key);
    if (value === undefined) {
      throw new ConfigurationError(`Required config key '${key}' is not loaded`);
    }
    return value;
  }

  private parseValue(key: string, value: unknown, definition: ConfigField): unknown {
    if (typeof value !== "string") {
      return value;
    }

    switch (definition.type) {
      case "number": {
        const num = Number(value);
        if (Number.isNaN(num)) {
          throw new ConfigurationError(`Config '${key}' expected number, got '${value}'`);
        }
        return num;
      }
      case "boolean": {
        if (value === "true" || value === "1") return true;
        if (value === "false" || value === "0") return false;
        throw new ConfigurationError(`Config '${key}' expected boolean, got '${value}'`);
      }
      case "string":
      default:
        return value;
    }
  }

  private getCache(): Record<string, unknown> {
    const result: Record<string, unknown> = {};
    for (const [key, value] of this.cache) {
      result[key] = value;
    }
    return result;
  }
}

export function createConfig(schema: ConfigSchema): Record<string, unknown> {
  const loader = new ConfigLoader();
  return loader.load(schema);
}
