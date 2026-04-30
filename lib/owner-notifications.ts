import "server-only";

import { SubscriptionPlan } from "@/generated/prisma/enums";

type NotificationRow = {
  label: string;
  value?: string | number | null;
};

type SendOwnerNotificationParams = {
  subject: string;
  title: string;
  intro: string;
  rows: NotificationRow[];
  badge?: string;
};

type NewUserNotificationParams = {
  name?: string | null;
  email: string;
  artistName?: string | null;
  workspaceName?: string | null;
  workspaceId?: string | null;
  ip?: string | null;
};

type NewSaleNotificationParams = {
  plan: SubscriptionPlan | string;
  amount?: number | null;
  currency?: string | null;
  customerEmail?: string | null;
  customerName?: string | null;
  workspaceName?: string | null;
  workspaceId?: string | null;
  stripeSessionId?: string | null;
  stripeSubscriptionId?: string | null;
};

type TourCompletedNotificationParams = {
  name?: string | null;
  email: string;
  workspaceName?: string | null;
  workspaceId?: string | null;
  ip?: string | null;
};

type OwnerNotificationResult = {
  sent: boolean;
  skipped: boolean;
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

function getOwnerNotificationEmails() {
  const directEmails = [
    process.env.OWNER_NOTIFICATION_EMAIL,
    process.env.OWNER_EMAIL,
    process.env.ADMIN_EMAILS,
  ]
    .filter(Boolean)
    .join(",");

  return directEmails
    .split(",")
    .map((email) => email.trim())
    .filter((email) => email.includes("@"));
}

function escapeHtml(value: string) {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

function formatValue(value?: string | number | null) {
  if (value === null || value === undefined || value === "") {
    return "—";
  }

  return String(value);
}

function formatMoney(amount?: number | null, currency?: string | null) {
  if (amount === null || amount === undefined) return null;

  const normalizedCurrency = (currency || "usd").toUpperCase();

  try {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: normalizedCurrency,
    }).format(amount / 100);
  } catch {
    return `${normalizedCurrency} ${(amount / 100).toFixed(2)}`;
  }
}

function getPlanLabel(plan: SubscriptionPlan | string) {
  const labels: Record<string, string> = {
    FREE: "Free",
    PRO: "Pro",
    PROFESSIONAL: "Professional",
    STUDIO: "Studio",
  };

  return labels[String(plan)] || String(plan);
}

function buildNotificationHtml(params: SendOwnerNotificationParams) {
  const appName = getAppName();
  const rowsHtml = params.rows
    .map((row) => {
      return `
        <tr>
          <td style="padding:12px 0;color:#64748b;font-size:13px;line-height:1.5;vertical-align:top;">${escapeHtml(row.label)}</td>
          <td style="padding:12px 0;color:#0f172a;font-size:13px;font-weight:700;line-height:1.5;text-align:right;vertical-align:top;">${escapeHtml(formatValue(row.value))}</td>
        </tr>
      `;
    })
    .join("");

  return `
    <!doctype html>
    <html>
      <head>
        <meta name="color-scheme" content="light only" />
        <meta name="supported-color-schemes" content="light" />
      </head>
      <body style="margin:0;padding:0;background:#ffffff;font-family:Arial,Helvetica,sans-serif;color:#0f172a;">
        <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background:#ffffff;margin:0;padding:28px 16px;">
          <tr>
            <td align="center">
              <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="max-width:560px;background:#ffffff;margin:0 auto;">
                <tr>
                  <td>
                    <p style="margin:0 0 12px;color:#0891b2;font-size:11px;font-weight:700;letter-spacing:0.22em;text-transform:uppercase;">
                      ${escapeHtml(params.badge || appName)}
                    </p>
                    <h1 style="margin:0 0 12px;color:#0f172a;font-size:26px;line-height:1.22;font-weight:800;letter-spacing:-0.03em;">
                      ${escapeHtml(params.title)}
                    </h1>
                    <p style="margin:0 0 24px;color:#475569;font-size:15px;line-height:1.7;">
                      ${escapeHtml(params.intro)}
                    </p>

                    <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="border-collapse:collapse;background:#f8fafc;border-radius:18px;padding:0 18px;">
                      ${rowsHtml}
                    </table>

                    <p style="margin:24px 0 0;color:#94a3b8;font-size:12px;line-height:1.6;">
                      Notificação automática enviada pelo ${escapeHtml(appName)}.
                    </p>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
        </table>
      </body>
    </html>
  `;
}

export async function sendOwnerNotificationEmail(
  params: SendOwnerNotificationParams,
): Promise<OwnerNotificationResult> {
  const apiKey = process.env.RESEND_API_KEY?.trim();
  const to = getOwnerNotificationEmails();

  if (!to.length) {
    console.log("[owner-notification] OWNER_NOTIFICATION_EMAIL não configurado.");
    return { sent: false, skipped: true };
  }

  if (!apiKey) {
    console.log("[owner-notification] RESEND_API_KEY não configurado.", {
      to,
      subject: params.subject,
      title: params.title,
    });
    return { sent: false, skipped: true };
  }

  const response = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      from: getEmailFrom(),
      to,
      subject: params.subject,
      html: buildNotificationHtml(params),
    }),
  });

  if (!response.ok) {
    const text = await response.text().catch(() => "");
    console.error("Erro ao enviar notificação para owner:", text);
    return { sent: false, skipped: false };
  }

  return { sent: true, skipped: false };
}

export async function sendOwnerNewUserSignupEmail(
  params: NewUserNotificationParams,
) {
  try {
    return await sendOwnerNotificationEmail({
      subject: "Novo usuário teste cadastrado - DJ Pro IA",
      title: "Novo cadastro na plataforma",
      intro:
        "Um novo usuário criou conta e entrou no fluxo de verificação por e-mail.",
      badge: "Novo usuário teste",
      rows: [
        { label: "Nome", value: params.name },
        { label: "E-mail", value: params.email },
        { label: "Nome artístico", value: params.artistName },
        { label: "Workspace", value: params.workspaceName },
        { label: "Workspace ID", value: params.workspaceId },
        { label: "IP", value: params.ip },
        { label: "Data", value: new Date().toLocaleString("pt-BR") },
      ],
    });
  } catch (error) {
    console.error("Erro inesperado ao notificar novo cadastro:", error);
    return { sent: false, skipped: false };
  }
}

export async function sendOwnerNewSaleEmail(params: NewSaleNotificationParams) {
  try {
    return await sendOwnerNotificationEmail({
      subject: `Nova venda confirmada - ${getPlanLabel(params.plan)}`,
      title: "Nova venda confirmada",
      intro:
        "Uma assinatura foi confirmada pela Stripe. Confira os detalhes abaixo.",
      badge: "Nova venda",
      rows: [
        { label: "Plano", value: getPlanLabel(params.plan) },
        { label: "Valor", value: formatMoney(params.amount, params.currency) },
        { label: "Cliente", value: params.customerName },
        { label: "E-mail do cliente", value: params.customerEmail },
        { label: "Workspace", value: params.workspaceName },
        { label: "Workspace ID", value: params.workspaceId },
        { label: "Sessão Stripe", value: params.stripeSessionId },
        { label: "Assinatura Stripe", value: params.stripeSubscriptionId },
        { label: "Data", value: new Date().toLocaleString("pt-BR") },
      ],
    });
  } catch (error) {
    console.error("Erro inesperado ao notificar nova venda:", error);
    return { sent: false, skipped: false };
  }
}

export async function sendOwnerTourCompletedEmail(
  params: TourCompletedNotificationParams,
) {
  try {
    return await sendOwnerNotificationEmail({
      subject: "Usuário concluiu o tour inicial - DJ Pro IA",
      title: "Tour inicial concluído",
      intro:
        "Um usuário concluiu o guia inicial da tela de criação de banner. Esse é um sinal importante de ativação depois do cadastro.",
      badge: "Tour concluído",
      rows: [
        { label: "Nome", value: params.name },
        { label: "E-mail", value: params.email },
        { label: "Workspace", value: params.workspaceName },
        { label: "Workspace ID", value: params.workspaceId },
        { label: "IP", value: params.ip },
        { label: "Data", value: new Date().toLocaleString("pt-BR") },
      ],
    });
  } catch (error) {
    console.error("Erro inesperado ao notificar tour concluído:", error);
    return { sent: false, skipped: false };
  }
}
