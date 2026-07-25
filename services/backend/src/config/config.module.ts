import { Global, Module } from "@nestjs/common";
import { ConfigLoader } from "@atlas/config";

export const CONFIG_LOADER = "CONFIG_LOADER";

@Global()
@Module({
  providers: [
    {
      provide: CONFIG_LOADER,
      useFactory(): ConfigLoader {
        return new ConfigLoader();
      },
    },
  ],
  exports: [CONFIG_LOADER],
})
export class ConfigModule {}
