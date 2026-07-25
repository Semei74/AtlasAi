export class TokenCounter {
  public estimateTokens(text: string): number {
    if (text.length === 0) return 0;
    return Math.ceil(text.length / 4);
  }
}

export const tokenCounter = new TokenCounter();
