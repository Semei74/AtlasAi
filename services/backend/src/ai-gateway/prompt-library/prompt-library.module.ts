import { Module } from "@nestjs/common";
import { PromptService } from "./services/prompt.service.js";
import { PrismaPromptRepository } from "./repositories/prompt.repository.js";
import { PrismaPromptVersionRepository } from "./repositories/prompt-version.repository.js";
import { PrismaPromptCategoryRepository } from "./repositories/prompt-category.repository.js";
import { PrismaPromptExecutionRepository } from "./repositories/prompt-execution.repository.js";
import { TemplateEngineService } from "./template-engine/template-engine.service.js";
import { PromptValidatorService } from "./validation/prompt-validator.service.js";
import { PromptLibraryCacheService } from "./cache/prompt-cache.service.js";
import { PromptLibraryController } from "./controllers/prompt-library.controller.js";
import { PII_REDACTOR } from "../pii/interfaces/pii-redactor.interface.js";
import { PiiRedactorService } from "../pii/services/pii-redactor.service.js";

@Module({
  controllers: [PromptLibraryController],
  providers: [
    PromptService,
    PrismaPromptRepository,
    PrismaPromptVersionRepository,
    PrismaPromptCategoryRepository,
    PrismaPromptExecutionRepository,
    TemplateEngineService,
    PromptValidatorService,
    PromptLibraryCacheService,
    {
      provide: PII_REDACTOR,
      useClass: PiiRedactorService,
    },
  ],
  exports: [
    PromptService,
    TemplateEngineService,
    PromptValidatorService,
    PromptLibraryCacheService,
  ],
})
export class PromptLibraryModule {}
