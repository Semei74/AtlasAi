import { Injectable } from "@nestjs/common";

@Injectable()
export class QueryProcessorService {
  public normalize(query: string): string {
    return query.trim().replace(/\s+/g, " ");
  }

  public expand(query: string): readonly string[] {
    const normalized = this.normalize(query);
    if (normalized.length === 0) return [];

    const queries = [normalized];
    const questionWords = ["what", "how", "why", "when", "where", "who", "which", "explain", "describe"];

    const lower = normalized.toLowerCase();
    const hasQuestionWord = questionWords.some((w) => lower.startsWith(w));

    if (!hasQuestionWord && normalized.split(/\s+/).length <= 3) {
      for (const qw of questionWords) {
        queries.push(`${qw} ${normalized}`);
      }
    }

    return queries;
  }
}
