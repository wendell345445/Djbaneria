export type SafeApiPayload = {
  error?: string;
  message?: string;
  [key: string]: unknown;
};

function asSafePayload<T extends SafeApiPayload>(payload: SafeApiPayload): T {
  return payload as unknown as T;
}

export async function readSafeApiResponse<
  T extends SafeApiPayload = SafeApiPayload,
>(response: Response): Promise<T> {
  const contentType = response.headers.get("content-type") || "";
  const text = await response.text();

  if (!text) {
    return asSafePayload<T>({});
  }

  if (contentType.includes("application/json")) {
    try {
      return JSON.parse(text) as T;
    } catch {
      return asSafePayload<T>({
        error: "The server returned an invalid JSON response.",
        rawResponse: text,
      });
    }
  }

  try {
    return JSON.parse(text) as T;
  } catch {
    return asSafePayload<T>({
      error: normalizePlainTextApiError(text, response.status),
      rawResponse: text,
    });
  }
}

export function getSafeApiErrorMessage(
  response: Response,
  data: SafeApiPayload,
  fallback = "Request failed. Please try again.",
) {
  if (typeof data.error === "string" && data.error.trim()) {
    return data.error;
  }

  if (typeof data.message === "string" && data.message.trim()) {
    return data.message;
  }

  if (response.status === 413) {
    return "The image is too large. Please upload a smaller image and try again.";
  }

  return fallback;
}

function normalizePlainTextApiError(text: string, status: number) {
  const cleanText = text.trim();

  if (
    status === 413 ||
    cleanText.toLowerCase().includes("request entity too large") ||
    cleanText.toLowerCase().includes("payload too large")
  ) {
    return "The image is too large. Please upload a smaller image and try again.";
  }

  if (cleanText.length > 0 && cleanText.length <= 240) {
    return cleanText;
  }

  return "The server returned an unexpected response. Please try again.";
}
