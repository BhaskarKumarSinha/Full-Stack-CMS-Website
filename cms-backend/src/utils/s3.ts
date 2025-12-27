// src/utils/s3.ts
import {
  S3Client,
  PutObjectCommand,
  DeleteObjectCommand,
} from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { Upload } from "@aws-sdk/lib-storage";
import fs from "fs";
import path from "path";
import config from "../config";
import logger from "./logger";

if (!config.S3_BUCKET) {
  logger.info("S3_BUCKET not configured — S3 utilities will not be available.");
}

const s3 = config.S3_BUCKET
  ? new S3Client({
      region: config.AWS_REGION,
      credentials: {
        accessKeyId: config.AWS_ACCESS_KEY_ID || "",
        secretAccessKey: config.AWS_SECRET_ACCESS_KEY || "",
      },
    })
  : null;

/**
 * Upload buffer to S3 and return public url.
 */
export async function uploadBufferToS3(
  buffer: Buffer,
  key: string,
  contentType: string
) {
  if (!s3 || !config.S3_BUCKET) throw new Error("S3 not configured");
  const upload = new Upload({
    client: s3,
    params: {
      Bucket: config.S3_BUCKET!,
      Key: key,
      Body: buffer,
      ContentType: contentType,
      ACL: "public-read",
    },
  });
  const result = await upload.done();
  // Public URL - if you have CloudFront, replace accordingly
  const url = `https://${config.S3_BUCKET}.s3.${
    config.AWS_REGION
  }.amazonaws.com/${encodeURIComponent(key)}`;
  return { result, url };
}

/**
 * Get presigned PUT url for direct upload from client.
 */
export async function getPresignedPutUrl(
  key: string,
  contentType: string,
  expiresInSeconds = 60 * 5
) {
  if (!s3 || !config.S3_BUCKET) throw new Error("S3 not configured");
  const cmd = new PutObjectCommand({
    Bucket: config.S3_BUCKET!,
    Key: key,
    ContentType: contentType,
    ACL: "public-read",
  });
  const url = await getSignedUrl(s3, cmd, { expiresIn: expiresInSeconds });
  return url;
}

/**
 * Delete object from S3
 */
export async function deleteFromS3(key: string) {
  if (!s3 || !config.S3_BUCKET) throw new Error("S3 not configured");
  const cmd = new DeleteObjectCommand({ Bucket: config.S3_BUCKET!, Key: key });
  await s3.send(cmd);
  return true;
}
