interface ImportMetaEnv {
  readonly VITE_POSTHOG_KEY?: string;
  readonly VITE_POSTHOG_HOST?: string;
  readonly [key: string]: string | undefined;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}

declare function defineBackground(callback: () => void): void;
declare function defineContentScript(options: { matches: string[]; main: () => void }): void;
