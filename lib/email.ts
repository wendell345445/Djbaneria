import "server-only";

type SendVerificationCodeParams = {
  to: string;
  name?: string | null;
  code: string;
};

type SendEmailResult = {
  sent: boolean;
  devMode: boolean;
};

function getAppName() {
  return process.env.NEXT_PUBLIC_APP_NAME?.trim() || "DJ Pro IA";
}

function getEmailFrom() {
  return (
    process.env.EMAIL_FROM?.trim() ||
    process.env.RESEND_FROM_EMAIL?.trim() ||
    "DJ Pro IA <onboarding@resend.dev>"
  );
}

function escapeHtml(value: string) {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

function buildVerificationEmailHtml(params: SendVerificationCodeParams) {
  const appName = escapeHtml(getAppName());
  const safeName = escapeHtml(params.name?.trim() || "DJ");
  const safeCode = escapeHtml(params.code);

  return `<!doctype html>
<html lang="pt-BR" style="margin:0;padding:0;background:#ffffff!important;background-color:#ffffff!important;color-scheme:light supported-color-schemes:light;">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <meta name="color-scheme" content="light" />
    <meta name="supported-color-schemes" content="light" />
    <title>Confirme sua conta</title>
    <style>
      :root {
        color-scheme: light;
        supported-color-schemes: light;
      }

      html,
      body,
      table,
      td,
      div,
      p,
      a,
      span,
      strong {
        color-scheme: light !important;
      }

      html,
      body,
      .body,
      .email-bg,
      .email-wrap {
        margin: 0 !important;
        padding: 0 !important;
        background: #ffffff !important;
        background-color: #ffffff !important;
      }

      .email-card,
      .email-card td,
      .email-code-box,
      .email-footer {
        background: #ffffff !important;
        background-color: #ffffff !important;
      }

      @media (prefers-color-scheme: dark) {
        html,
        body,
        .body,
        .email-bg,
        .email-wrap,
        .email-card,
        .email-card td,
        .email-code-box,
        .email-footer {
          background: #ffffff !important;
          background-color: #ffffff !important;
        }

        .email-title,
        .email-code {
          color: #111827 !important;
        }

        .email-text,
        .email-muted {
          color: #4b5563 !important;
        }
      }

      [data-ogsc] body,
      [data-ogsc] .body,
      [data-ogsc] .email-bg,
      [data-ogsc] .email-wrap,
      [data-ogsc] .email-card,
      [data-ogsc] .email-card td,
      [data-ogsc] .email-code-box,
      [data-ogsc] .email-footer,
      [data-ogsb] body,
      [data-ogsb] .body,
      [data-ogsb] .email-bg,
      [data-ogsb] .email-wrap,
      [data-ogsb] .email-card,
      [data-ogsb] .email-card td,
      [data-ogsb] .email-code-box,
      [data-ogsb] .email-footer {
        background: #ffffff !important;
        background-color: #ffffff !important;
      }
    </style>
  </head>
  <body class="body" bgcolor="#ffffff" style="margin:0!important;padding:0!important;background:#ffffff!important;background-color:#ffffff!important;font-family:Arial,Helvetica,sans-serif;color:#111827!important;">
    <table class="email-bg" role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" bgcolor="#ffffff" style="width:100%;min-width:100%;margin:0;padding:0;border-collapse:collapse;background:#ffffff!important;background-color:#ffffff!important;">
      <tr>
        <td class="email-wrap" align="center" bgcolor="#ffffff" style="background:#ffffff!important;background-color:#ffffff!important;padding:32px 16px;">
          <table class="email-card" role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" bgcolor="#ffffff" style="width:100%;max-width:560px;border-collapse:separate;background:#ffffff!important;background-color:#ffffff!important;border-radius:22px;overflow:hidden;">
            <tr>
              <td bgcolor="#ffffff" style="padding:30px 28px 26px;background:#ffffff!important;background-color:#ffffff!important;">
                <p class="email-muted" style="margin:0 0 14px;font-size:11px;line-height:1.4;font-weight:700;letter-spacing:0.16em;text-transform:uppercase;color:#6b7280!important;background:#ffffff!important;background-color:#ffffff!important;">
                  Verificação de e-mail
                </p>

                <h1 class="email-title" style="margin:0 0 12px;font-size:25px;line-height:1.2;font-weight:800;color:#111827!important;background:#ffffff!important;background-color:#ffffff!important;">
                  Confirme sua conta no ${appName}
                </h1>

                <p class="email-text" style="margin:0 0 24px;font-size:15px;line-height:1.7;color:#4b5563!important;background:#ffffff!important;background-color:#ffffff!important;">
                  Olá, ${safeName}. Use o código abaixo para confirmar seu e-mail e liberar o acesso à geração de banners.
                </p>

                <table class="email-code-box" role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" bgcolor="#ffffff" style="margin:24px 0;border-collapse:separate;background:#ffffff!important;background-color:#ffffff!important;border-radius:18px;">
                  <tr>
                    <td align="center" bgcolor="#ffffff" style="padding:20px 18px;background:#ffffff!important;background-color:#ffffff!important;">
                      <p class="email-muted" style="margin:0 0 9px;font-size:11px;line-height:1.4;letter-spacing:0.16em;text-transform:uppercase;color:#6b7280!important;font-weight:700;background:#ffffff!important;background-color:#ffffff!important;">
                        Seu código
                      </p>
                      <strong class="email-code" style="display:block;font-size:36px;line-height:1.1;letter-spacing:0.22em;color:#111827!important;font-weight:900;background:#ffffff!important;background-color:#ffffff!important;">
                        ${safeCode}
                      </strong>
                    </td>
                  </tr>
                </table>

                <p class="email-muted" style="margin:0;font-size:13px;line-height:1.7;color:#6b7280!important;background:#ffffff!important;background-color:#ffffff!important;">
                  Esse código expira em 15 minutos. Se você não solicitou esse cadastro, ignore este e-mail.
                </p>
              </td>
            </tr>
            <tr>
              <td class="email-footer" bgcolor="#ffffff" style="padding:18px 28px;background:#ffffff!important;background-color:#ffffff!important;">
                <p class="email-muted" style="margin:0;font-size:12px;line-height:1.6;color:#9ca3af!important;text-align:center;background:#ffffff!important;background-color:#ffffff!important;">
                  ${appName} • Geração de banners profissionais com IA
                </p>
              </td>
            </tr>
          </table>
        </td>
      </tr>
    </table>
  </body>
</html>`;
}

export async function sendVerificationCodeEmail(
  params: SendVerificationCodeParams,
): Promise<SendEmailResult> {
  const apiKey = process.env.RESEND_API_KEY?.trim();

  if (!apiKey) {
    console.log(`[email-verification] Código para ${params.to}: ${params.code}`);
    return { sent: false, devMode: true };
  }

  const response = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      from: getEmailFrom(),
      to: [params.to],
      subject: `Seu código de verificação - ${getAppName()}`,
      html: buildVerificationEmailHtml(params),
    }),
  });

  if (!response.ok) {
    const text = await response.text().catch(() => "");
    console.error("Erro ao enviar e-mail de verificação:", text);
    throw new Error("Não foi possível enviar o código de verificação.");
  }

  return { sent: true, devMode: false };
}
