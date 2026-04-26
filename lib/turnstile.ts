type TurnstileValidationResult = {
  success: boolean;
  error?: string;
  errorCodes?: string[];
};

type TurnstileValidationInput =
  | string
  | null
  | undefined
  | {
      token?: string | null;
      ip?: string | null;
      remoteIp?: string | null;
    };

type CloudflareTurnstileResponse = {
  success: boolean;
  "error-codes"?: string[];
  challenge_ts?: string;
  hostname?: string;
  action?: string;
  cdata?: string;
};

function resolveInput(input: TurnstileValidationInput) {
  if (typeof input === "object" && input !== null) {
    return {
      token: typeof input.token === "string" ? input.token.trim() : "",
      remoteIp:
        typeof input.ip === "string"
          ? input.ip
          : typeof input.remoteIp === "string"
            ? input.remoteIp
            : null,
    };
  }

  return {
    token: typeof input === "string" ? input.trim() : "",
    remoteIp: null,
  };
}

export async function validateTurnstileToken(
  input: TurnstileValidationInput,
  legacyRemoteIp?: string | null,
): Promise<TurnstileValidationResult> {
  const { token, remoteIp } = resolveInput(input);
  const effectiveRemoteIp = legacyRemoteIp || remoteIp;

  if (!token) {
    return {
      success: false,
      error: "Confirme que você não é um robô para continuar.",
      errorCodes: ["missing-token"],
    };
  }

  const secretKey = process.env.TURNSTILE_SECRET_KEY?.trim();

  if (!secretKey) {
    if (process.env.NODE_ENV !== "production") {
      console.warn(
        "TURNSTILE_SECRET_KEY não configurada. Validação Turnstile ignorada em desenvolvimento.",
      );

      return { success: true };
    }

    return {
      success: false,
      error: "Turnstile não configurado no servidor.",
      errorCodes: ["missing-secret"],
    };
  }

  const formData = new FormData();
  formData.append("secret", secretKey);
  formData.append("response", token);

  if (effectiveRemoteIp) {
    formData.append("remoteip", effectiveRemoteIp);
  }

  try {
    const response = await fetch(
      "https://challenges.cloudflare.com/turnstile/v0/siteverify",
      {
        method: "POST",
        body: formData,
      },
    );

    if (!response.ok) {
      return {
        success: false,
        error: "Não foi possível validar o Turnstile no momento.",
        errorCodes: [`http-${response.status}`],
      };
    }

    const data = (await response.json()) as CloudflareTurnstileResponse;

    if (!data.success) {
      return {
        success: false,
        error: "Confirme que você não é um robô para continuar.",
        errorCodes: data["error-codes"] || ["turnstile-failed"],
      };
    }

    return { success: true };
  } catch (error) {
    console.error("Erro ao validar Turnstile:", error);

    return {
      success: false,
      error: "Não foi possível validar o Turnstile no momento.",
      errorCodes: ["turnstile-request-failed"],
    };
  }
}
