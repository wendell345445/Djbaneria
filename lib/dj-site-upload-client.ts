const MAX_DJ_SITE_IMAGE_SIZE_BYTES = 5 * 1024 * 1024;

const ALLOWED_DJ_SITE_IMAGE_TYPES = new Set([
  "image/jpeg",
  "image/png",
  "image/webp",
]);

export type DjSiteUploadPurpose = "profile" | "cover";

export async function uploadDjSiteImageToR2(params: {
  file: File;
  purpose: DjSiteUploadPurpose;
}) {
  const { file, purpose } = params;

  if (!ALLOWED_DJ_SITE_IMAGE_TYPES.has(file.type)) {
    throw new Error("Use only JPG, PNG, or WebP images.");
  }

  if (file.size > MAX_DJ_SITE_IMAGE_SIZE_BYTES) {
    throw new Error("Image is too large. Upload a file up to 5 MB.");
  }

  const formData = new FormData();
  formData.set("purpose", purpose);
  formData.set("file", file);

  const response = await fetch("/api/dj-site/upload", {
    method: "POST",
    body: formData,
  });

  const data = (await response.json().catch(() => null)) as
    | {
        error?: string;
        publicUrl?: string;
        url?: string;
        storageKey?: string;
      }
    | null;

  if (!response.ok || !data?.publicUrl) {
    throw new Error(data?.error || "Could not upload image. Please try again.");
  }

  return {
    publicUrl: data.publicUrl,
    storageKey: data.storageKey || null,
  };
}
