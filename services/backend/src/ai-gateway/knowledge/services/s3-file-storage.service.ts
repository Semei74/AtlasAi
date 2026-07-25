import { Inject, Injectable } from "@nestjs/common";
import { AiProviderError } from "@atlas/errors";
import {
  S3Client,
  PutObjectCommand,
  GetObjectCommand,
  DeleteObjectCommand,
  HeadObjectCommand,
} from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { createHash } from "node:crypto";
import { randomUUID } from "node:crypto";
import type { FileStorage, FileUpload, FileUploadResult } from "../interfaces/file-storage.interface.js";
import type { S3ClientConfig } from "@aws-sdk/client-s3";

export const S3_STORAGE_CONFIG = Symbol("S3_STORAGE_CONFIG");

export interface S3StorageConfig {
  readonly region: string;
  readonly bucket: string;
  readonly endpoint?: string;
  readonly forcePathStyle?: boolean;
  readonly accessKeyId: string;
  readonly secretAccessKey: string;
  readonly sseAlgorithm?: string;
  readonly sseKmsKeyId?: string;
}

@Injectable()
export class S3FileStorageService implements FileStorage {
  private readonly client: S3Client;
  private readonly bucket: string;
  private readonly sseAlgorithm: string | undefined;
  private readonly sseKmsKeyId: string | undefined;

  public constructor(
    @Inject(S3_STORAGE_CONFIG)
    config: S3StorageConfig,
  ) {
    this.bucket = config.bucket;
    this.sseAlgorithm = config.sseAlgorithm;
    this.sseKmsKeyId = config.sseKmsKeyId;

    const clientConfig: S3ClientConfig = {
      region: config.region,
      credentials: {
        accessKeyId: config.accessKeyId,
        secretAccessKey: config.secretAccessKey,
      },
    };
    if (config.endpoint !== undefined) {
      clientConfig.endpoint = config.endpoint;
      clientConfig.forcePathStyle = config.forcePathStyle ?? true;
    }
    this.client = new S3Client(clientConfig);
  }

  public async store(file: FileUpload, documentId: string): Promise<FileUploadResult> {
    const storagePath = this.getPath(documentId, file.originalName);
    const checksum = createHash("sha256").update(file.buffer).digest("hex");

    const command = new PutObjectCommand({
      Bucket: this.bucket,
      Key: storagePath,
      Body: file.buffer,
      ContentType: file.mimeType,
      ContentLength: file.size,
      ChecksumSHA256: checksum,
      ServerSideEncryption: this.sseAlgorithm as "AES256" | "aws:kms" | undefined,
      SSEKMSKeyId: this.sseKmsKeyId,
      Metadata: {
        "original-name": file.originalName,
        "upload-checksum": checksum,
      },
    });

    await this.client.send(command);

    return { storagePath, checksum };
  }

  public async retrieve(storagePath: string): Promise<Buffer> {
    const command = new GetObjectCommand({
      Bucket: this.bucket,
      Key: storagePath,
    });

    const response = await this.client.send(command);
    const body = response.Body;

    if (body === undefined) {
      throw new AiProviderError("Empty response from S3");
    }

    return Buffer.from(await body.transformToByteArray());
  }

  public async delete(storagePath: string): Promise<void> {
    const command = new DeleteObjectCommand({
      Bucket: this.bucket,
      Key: storagePath,
    });

    await this.client.send(command);
  }

  public getPath(documentId: string, originalName: string): string {
    const parts = originalName.split(".");
    const rawExt = parts.length > 1 ? `.${parts[parts.length - 1] ?? ""}` : "";
    const ext = /^\.[a-zA-Z0-9]{1,10}$/.test(rawExt) ? rawExt : "";
    return `${documentId}/${randomUUID()}${ext}`;
  }

  public async exists(storagePath: string): Promise<boolean> {
    try {
      const command = new HeadObjectCommand({
        Bucket: this.bucket,
        Key: storagePath,
      });
      await this.client.send(command);
      return true;
    } catch {
      return false;
    }
  }

  public async getSignedUrl(storagePath: string, expiresInSeconds = 3600): Promise<string> {
    const command = new GetObjectCommand({
      Bucket: this.bucket,
      Key: storagePath,
    });

    return getSignedUrl(this.client, command, { expiresIn: expiresInSeconds });
  }
}
