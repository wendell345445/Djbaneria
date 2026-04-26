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

function buildVerificationEmailHtml(params: SendVerificationCodeParams) {
  const appName = getAppName();
  const safeName = params.name?.trim() || "DJ";

  return `
    <div style="margin:0;padding:32px;background:#050916;font-family:Arial,Helvetica,sans-serif;color:#ffffff;">
      <div style="max-width:560px;margin:0 auto;border:1px solid rgba(255,255,255,0.12);border-radius:28px;background:linear-gradient(180deg,#0b1020,#070b16);padding:32px;">
        <p style="margin:0 0 14px;font-size:11px;letter-spacing:0.22em;text-transform:uppercase;color:rgba(255,255,255,0.45);">Verificação de e-mail</p>
        <h1 style="margin:0 0 12px;font-size:26px;line-height:1.2;color:#ffffff;">Confirme sua conta no ${appName}</h1>
        <p style="margin:0 0 22px;font-size:15px;line-height:1.7;color:rgba(255,255,255,0.72);">Olá, ${safeName}. Use o código abaixo para confirmar seu e-mail e liberar o acesso à geração de banners.</p>
        <div style="margin:24px 0;padding:18px 22px;border-radius:20px;background:rgba(56,189,248,0.12);border:1px solid rgba(56,189,248,0.24);text-align:center;">
          <strong style="font-size:34px;letter-spacing:0.28em;color:#ffffff;">${params.code}</strong>
        </div>
        <p style="margin:0;font-size:13px;line-height:1.7;color:rgba(255,255,255,0.55);">Esse código expira em 15 minutos. Se você não solicitou esse cadastro, ignore este e-mail.</p>
      </div>
    </div>
  `;
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
