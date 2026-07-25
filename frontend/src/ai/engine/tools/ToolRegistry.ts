import type { ToolDefinition } from './types';

export class ToolRegistry {
  private tools: Map<string, ToolDefinition> = new Map();
  private categories: Map<string, ToolDefinition[]> = new Map();

  register(tool: ToolDefinition): void {
    this.tools.set(tool.name, tool);
    if (!this.categories.has(tool.category)) {
      this.categories.set(tool.category, []);
    }
    this.categories.get(tool.category)!.push(tool);
  }

  unregister(name: string): void {
    const tool = this.tools.get(name);
    if (tool) {
      this.tools.delete(name);
      const categoryTools = this.categories.get(tool.category);
      if (categoryTools) {
        const filtered = categoryTools.filter((t) => t.name !== name);
        if (filtered.length > 0) {
          this.categories.set(tool.category, filtered);
        } else {
          this.categories.delete(tool.category);
        }
      }
    }
  }

  get(name: string): ToolDefinition | undefined {
    return this.tools.get(name);
  }

  getAll(): ToolDefinition[] {
    return Array.from(this.tools.values());
  }

  getByCategory(category: string): ToolDefinition[] {
    return this.categories.get(category) ?? [];
  }

  getCategories(): string[] {
    return Array.from(this.categories.keys());
  }

  has(name: string): boolean {
    return this.tools.has(name);
  }

  count(): number {
    return this.tools.size;
  }

  search(query: string): ToolDefinition[] {
    const lower = query.toLowerCase();
    return Array.from(this.tools.values()).filter(
      (t) =>
        t.name.toLowerCase().includes(lower) ||
        t.description.toLowerCase().includes(lower),
    );
  }

  clear(): void {
    this.tools.clear();
    this.categories.clear();
  }
}
