import { PutObjectCommand, S3Client } from "@aws-sdk/client-s3";

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
