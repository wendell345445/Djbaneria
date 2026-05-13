import { DeleteObjectCommand, PutObjectCommand, S3Client } from "@aws-sdk/client-s3";

const r2Client = new S3Client({
  region: "auto",
  endpoint: process.env.R2_ACCOUNT_ID
    ? `https://${process.env.R2_ACCOUNT_ID}.r2.cloudflarestorage.com`
    : undefined,
  credentials:
    process.env.R2_ACCESS_KEY_ID && process.env.R2_SECRET_ACCESS_KEY
      ? {
          accessKeyId: process.env.R2_ACCESS_KEY_ID,
          secretAccessKey: process.env.R2_SECRET_ACCESS_KEY,
        }
      : undefined,
});

export async function uploadBufferToR2(params: {
  key: string;
  body: Buffer;
  contentType?: string;
  cacheControl?: string;
}) {
  const bucket = process.env.R2_BUCKET_NAME;
  const publicBaseUrl = process.env.R2_PUBLIC_BASE_URL;

  if (!bucket || !publicBaseUrl) {
    throw new Error("R2 não configurado.");
  }

  await r2Client.send(
    new PutObjectCommand({
      Bucket: bucket,
      Key: params.key,
      Body: params.body,
      ContentType: params.contentType || "application/octet-stream",
      CacheControl: params.cacheControl || "public, max-age=31536000, immutable",
    }),
  );

  return {
    url: `${publicBaseUrl.replace(/\/$/, "")}/${params.key}`,
    key: params.key,
  };
}

export async function uploadBannerBuffer(params: {
  key: string;
  body: Buffer;
  contentType?: string;
}) {
  const uploaded = await uploadBufferToR2({
    key: params.key,
    body: params.body,
    contentType: params.contentType || "image/png",
  });

  return {
    url: uploaded.url,
  };
}

export async function deleteObjectFromR2(key?: string | null) {
  if (!key) return false;

  const bucket = process.env.R2_BUCKET_NAME;

  if (!bucket) {
    throw new Error("R2 não configurado.");
  }

  await r2Client.send(
    new DeleteObjectCommand({
      Bucket: bucket,
      Key: key,
    }),
  );

  return true;
}

export async function deleteObjectsFromR2(keys: Array<string | null | undefined>) {
  const uniqueKeys = Array.from(
    new Set(keys.filter((key): key is string => Boolean(key))),
  );

  const results = await Promise.allSettled(
    uniqueKeys.map((key) => deleteObjectFromR2(key)),
  );

  return {
    attempted: uniqueKeys.length,
    deleted: results.filter((result) => result.status === "fulfilled").length,
    failed: results.filter((result) => result.status === "rejected").length,
  };
}
