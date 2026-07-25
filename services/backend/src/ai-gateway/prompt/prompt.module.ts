import { Module } from "@nestjs/common";
import { PROMPT_LOADER } from "./interfaces/prompt-loader.interface.js";
import { PROMPT_CACHE } from "./interfaces/prompt-cache.interface.js";
import { PROMPT_VALIDATOR } from "./interfaces/prompt-validator.interface.js";
import { PROMPT_MANAGER } from "./interfaces/prompt-manager.interface.js";
import { PromptLoaderService } from "./services/prompt-loader.service.js";
import { PromptCacheService } from "./services/prompt-cache.service.js";
import { PromptValidatorService } from "./services/prompt-validator.service.js";
import { PromptManagerService } from "./services/prompt-manager.service.js";
import { DEFAULT_PROMPTS } from "./default-prompts.js";

@Module({
  providers: [
    {
      provide: PROMPT_LOADER,
      useFactory: (): PromptLoaderService => {
        const loader = new PromptLoaderService();
        for (const prompt of DEFAULT_PROMPTS) {
          loader.register(prompt);
        }
        return loader;
      },
    },
    {
      provide: PROMPT_CACHE,
      useFactory: (): PromptCacheService => new PromptCacheService(60_000, 1000),
    },
    {
      provide: PROMPT_VALIDATOR,
      useClass: PromptValidatorService,
    },
    {
      provide: PROMPT_MANAGER,
      useClass: PromptManagerService,
    },
  ],
  exports: [PROMPT_MANAGER, PROMPT_LOADER, PROMPT_CACHE, PROMPT_VALIDATOR],
})
export class PromptModule {}
