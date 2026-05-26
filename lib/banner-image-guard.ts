export const ALLOWED_REFERENCE_IMAGE_MIME_TYPES = new Set([
  "image/jpeg",
  "image/jpg",
  "image/png",
  "image/webp",
]);

export const MAX_REFERENCE_IMAGE_FILE_BYTES = 5 * 1024 * 1024;
export const MAX_REFERENCE_IMAGE_DATA_URL_LENGTH = 2_800_000;
export const MAX_REFERENCE_IMAGE_DECODED_BYTES = 2_100_000;

export function formatImageSize(bytes: number) {
  if (!Number.isFinite(bytes) || bytes <= 0) return "0 MB";
  return `${(bytes / 1024 / 1024).toFixed(bytes >= 1024 * 1024 ? 1 : 2)} MB`;
}

export function getReferenceImageFileValidationError(file: {
  type?: string;
  size?: number;
}) {
  const mimeType = file.type?.toLowerCase().trim() || "";

  if (!ALLOWED_REFERENCE_IMAGE_MIME_TYPES.has(mimeType)) {
    return "Please upload a JPG, PNG or WebP image. HEIC, GIF and TIFF files are not supported.";
  }

  if (typeof file.size === "number" && file.size > MAX_REFERENCE_IMAGE_FILE_BYTES) {
    return `This image is too large (${formatImageSize(file.size)}). Please upload a JPG, PNG or WebP up to 5 MB.`;
  }

  return null;
}

export function getReferenceDataUrlValidationError(value: string | null | undefined) {
  if (!value || !value.startsWith("data:image/")) return null;

  if (value.length > MAX_REFERENCE_IMAGE_DATA_URL_LENGTH) {
    return "The uploaded image is still too large after optimization. Please upload a smaller JPG, PNG or WebP image.";
  }

  const match = value.match(/^data:(image\/[a-zA-Z0-9.+-]+);base64,(.+)$/);
  if (!match) {
    return "The uploaded image is invalid. Please upload a JPG, PNG or WebP image.";
  }

  const mimeType = match[1]?.toLowerCase().trim() || "";
  if (!ALLOWED_REFERENCE_IMAGE_MIME_TYPES.has(mimeType)) {
    return "Please upload a JPG, PNG or WebP image. HEIC, GIF and TIFF files are not supported.";
  }

  const base64 = match[2] || "";
  const decodedBytes = Math.ceil((base64.length * 3) / 4);

  if (decodedBytes > MAX_REFERENCE_IMAGE_DECODED_BYTES) {
    return "The uploaded image is still too large after optimization. Please upload a smaller JPG, PNG or WebP image.";
  }

  return null;
}
