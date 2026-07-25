interface DownloadOptions {
  url: string;
  filename?: string;
  signal?: AbortSignal;
}

export function createDownloadClient(
  getAccessToken: () => string | null,
): { download: (options: DownloadOptions) => Promise<void> } {
  return {
    async download({ url, filename, signal }: DownloadOptions): Promise<void> {
      const response = await fetch(url, {
        headers: {
          Authorization: `Bearer ${getAccessToken() ?? ""}`,
        },
        signal,
      });

      if (!response.ok) {
        throw new Error(
          `Download failed with status ${String(response.status)}`,
        );
      }

      const blob = await response.blob();
      const blobUrl = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = blobUrl;
      const name =
        filename ?? url.split("/").pop() ?? `download-${String(Date.now())}`;
      link.download = name;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(blobUrl);
    },
  };
}
