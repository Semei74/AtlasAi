const REFRESH_TOKEN_KEY = "atlas_refresh_token";

interface ChromeStorageArea {
  get(key: string): Promise<Record<string, unknown>>;
  set(items: Record<string, unknown>): Promise<void>;
  remove(key: string): Promise<void>;
}

interface ChromeStorageShim {
  storage?: { local?: ChromeStorageArea };
}

const isBrowser = typeof window !== "undefined";
const isExtension =
  isBrowser &&
  typeof chrome !== "undefined" &&
  (chrome as unknown as ChromeStorageShim).storage?.local !== undefined;

export const secureStorage = {
  async getRefreshToken(): Promise<string | null> {
    if (isExtension) {
      const result = await chrome.storage.local.get(REFRESH_TOKEN_KEY);
      return (result[REFRESH_TOKEN_KEY] as string | undefined) ?? null;
    }
    if (isBrowser) {
      return localStorage.getItem(REFRESH_TOKEN_KEY);
    }
    return null;
  },

  async setRefreshToken(token: string): Promise<void> {
    if (isExtension) {
      await chrome.storage.local.set({ [REFRESH_TOKEN_KEY]: token });
      return;
    }
    if (isBrowser) {
      localStorage.setItem(REFRESH_TOKEN_KEY, token);
    }
  },

  async clearTokens(): Promise<void> {
    if (isExtension) {
      await chrome.storage.local.remove(REFRESH_TOKEN_KEY);
      return;
    }
    if (isBrowser) {
      localStorage.removeItem(REFRESH_TOKEN_KEY);
    }
  },

  getItem(name: string): string | null {
    if (isExtension) return null;
    if (isBrowser) return localStorage.getItem(name);
    return null;
  },

  setItem(name: string, value: string): void {
    if (isExtension) return;
    if (isBrowser) localStorage.setItem(name, value);
  },

  removeItem(name: string): void {
    if (isExtension) return;
    if (isBrowser) localStorage.removeItem(name);
  },
};
