export interface SSEClient {
  connect: (url: string) => void;
  disconnect: () => void;
  onMessage: (handler: (data: unknown) => void) => void;
  onError: (handler: (error: Event) => void) => void;
}

export function createSSEClient(
  getAccessToken: () => string | null,
): SSEClient {
  let eventSource: EventSource | null = null;
  let messageHandler: ((data: unknown) => void) | null = null;
  let errorHandler: ((error: Event) => void) | null = null;

  return {
    connect(url: string): void {
      const token = getAccessToken();
      const fullUrl = token
        ? `${url}${url.includes("?") ? "&" : "?"}token=${token}`
        : url;

      eventSource = new EventSource(fullUrl);

      eventSource.onmessage = (event: MessageEvent): void => {
        try {
          const data = JSON.parse(event.data as string) as unknown;
          messageHandler?.(data);
        } catch {
          messageHandler?.(event.data);
        }
      };

      eventSource.onerror = (event: Event): void => {
        errorHandler?.(event);
      };
    },

    disconnect(): void {
      eventSource?.close();
      eventSource = null;
    },

    onMessage(handler: (data: unknown) => void): void {
      messageHandler = handler;
    },

    onError(handler: (error: Event) => void): void {
      errorHandler = handler;
    },
  };
}
