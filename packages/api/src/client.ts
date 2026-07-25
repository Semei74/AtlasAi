import createOpenApiClient, { type Client as OpenFetchClient } from "openapi-fetch";
import type { paths } from "./generated";

export interface ClientConfig {
  baseUrl: string;
  getAccessToken: () => string | null;
  onAuthError?: () => void;
}

export type ApiClient = OpenFetchClient<paths>;

export function createClient(config: ClientConfig): ApiClient {
  const client = createOpenApiClient<paths>({
    baseUrl: config.baseUrl,
    headers: {
      "Content-Type": "application/json",
    },
  });

  client.use({
    onRequest({ request }) {
      const token = config.getAccessToken();
      if (token) {
        request.headers.set("Authorization", `Bearer ${token}`);
      }
      return request;
    },
    onResponse({ response }) {
      if (response.status === 401) {
        config.onAuthError?.();
      }
      return response;
    },
  });

  return client;
}
