import {
  getReferenceImageFileValidationError,
  MAX_REFERENCE_IMAGE_DATA_URL_LENGTH,
} from "@/lib/banner-image-guard";

type OptimizeImageOptions = {
  maxWidth?: number;
  maxHeight?: number;
  quality?: number;
  outputType?: "image/jpeg" | "image/webp";
  maxDataUrlBytes?: number;
};

const DEFAULT_OPTIONS: Required<OptimizeImageOptions> = {
  maxWidth: 1600,
  maxHeight: 1600,
  quality: 0.82,
  outputType: "image/jpeg",
  maxDataUrlBytes: 2_500_000,
};

export { getReferenceImageFileValidationError };

export async function fileToOptimizedDataUrl(
  file: File,
  options: OptimizeImageOptions = {},
) {
  const fileValidationError = getReferenceImageFileValidationError(file);
  if (fileValidationError) {
    throw new Error(fileValidationError);
  }

  const config = {
    ...DEFAULT_OPTIONS,
    ...options,
  };

  const maxDataUrlBytes = Math.min(
    config.maxDataUrlBytes,
    MAX_REFERENCE_IMAGE_DATA_URL_LENGTH,
  );

  const originalDataUrl = await readFileAsDataUrl(file);

  if (originalDataUrl.length <= maxDataUrlBytes) {
    return originalDataUrl;
  }

  const image = await loadImage(originalDataUrl);
  const { width, height } = getContainSize({
    width: image.naturalWidth || image.width,
    height: image.naturalHeight || image.height,
    maxWidth: config.maxWidth,
    maxHeight: config.maxHeight,
  });

  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;

  const context = canvas.getContext("2d");

  if (!context) {
    throw new Error("Could not prepare the image.");
  }

  context.fillStyle = "#000000";
  context.fillRect(0, 0, width, height);
  context.drawImage(image, 0, 0, width, height);

  let quality = config.quality;
  let optimizedDataUrl = canvas.toDataURL(config.outputType, quality);

  while (optimizedDataUrl.length > maxDataUrlBytes && quality > 0.5) {
    quality = Math.max(0.5, quality - 0.08);
    optimizedDataUrl = canvas.toDataURL(config.outputType, quality);
  }

  if (optimizedDataUrl.length > maxDataUrlBytes) {
    throw new Error(
      "The image is still too large after optimization. Please upload a smaller JPG, PNG or WebP image.",
    );
  }

  return optimizedDataUrl;
}

function readFileAsDataUrl(file: File) {
  return new Promise<string>((resolve, reject) => {
    const reader = new FileReader();

    reader.onload = () => {
      if (typeof reader.result === "string") {
        resolve(reader.result);
        return;
      }

      reject(new Error("Could not read the image."));
    };

    reader.onerror = () => {
      reject(new Error("Could not read the image."));
    };

    reader.readAsDataURL(file);
  });
}

function loadImage(src: string) {
  return new Promise<HTMLImageElement>((resolve, reject) => {
    const image = new Image();

    image.onload = () => resolve(image);
    image.onerror = () => reject(new Error("Could not load the image."));
    image.src = src;
  });
}

function getContainSize(params: {
  width: number;
  height: number;
  maxWidth: number;
  maxHeight: number;
}) {
  const ratio = Math.min(
    params.maxWidth / params.width,
    params.maxHeight / params.height,
    1,
  );

  return {
    width: Math.max(1, Math.round(params.width * ratio)),
    height: Math.max(1, Math.round(params.height * ratio)),
  };
}
