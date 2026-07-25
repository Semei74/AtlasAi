interface UploadProgress {
  bytesSent: number;
  totalBytes: number;
  percentage: number;
}

interface UploadOptions {
  url: string;
  file: File;
  onProgress?: (progress: UploadProgress) => void;
  signal?: AbortSignal;
}

export function createUploadClient(
  getAccessToken: () => string | null,
): {
  upload: (options: UploadOptions) => Promise<{ url: string }>;
} {
  return {
    upload({
      url,
      file,
      onProgress,
      signal,
    }: UploadOptions): Promise<{ url: string }> {
      const xhr = new XMLHttpRequest();

      return new Promise<{ url: string }>((resolve, reject) => {
        xhr.upload.addEventListener("progress", (event: ProgressEvent) => {
          if (event.lengthComputable) {
            onProgress?.({
              bytesSent: event.loaded,
              totalBytes: event.total,
              percentage: Math.round((event.loaded / event.total) * 100),
            });
          }
        });

        xhr.addEventListener("load", () => {
          if (xhr.status >= 200 && xhr.status < 300) {
            resolve(JSON.parse(xhr.responseText) as { url: string });
          } else {
            reject(
              new Error(`Upload failed with status ${String(xhr.status)}`),
            );
          }
        });

        xhr.addEventListener("error", () => {
          reject(new Error("Upload failed"));
        });

        xhr.addEventListener("abort", () => {
          reject(new Error("Upload aborted"));
        });

        xhr.open("POST", url);
        const token = getAccessToken();
        if (token) {
          xhr.setRequestHeader("Authorization", `Bearer ${token}`);
        }

        const formData = new FormData();
        formData.append("file", file);

        if (signal) {
          signal.addEventListener("abort", () => {
            xhr.abort();
          });
        }

        xhr.send(formData);
      });
    },
  };
}
