import { Injectable } from "@nestjs/common";
import { CHARS_PER_TOKEN } from "./cost-constants.js";
import type { TokenEstimator } from "./interfaces/token-estimator.interface.js";

@Injectable()
export class DefaultTokenEstimator implements TokenEstimator {
  public estimate(text: string, _model?: string): number {
    if (text.length === 0) {
      return 0;
    }

    return Math.ceil(text.length / CHARS_PER_TOKEN);
  }
}
