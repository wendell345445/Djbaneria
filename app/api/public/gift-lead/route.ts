import { NextResponse } from "next/server";
import { Resend } from "resend";

type GiftLeadPayload = {
  name?: string;
  selectedPlan?: string;
  source?: string;
};

const VALID_PLANS = new Set(["PRO", "PROFESSIONAL", "STUDIO"]);

function getNotificationRecipients() {
  const raw =
    process.env.OWNER_NOTIFICATION_EMAIL ||
    process.env.OWNER_EMAIL ||
    process.env.ADMIN_EMAILS ||
    "";

  return raw
    .split(",")
    .map((email) => email.trim())
    .filter(Boolean);
}

function getFromEmail() {
  return (
    process.env.EMAIL_FROM ||
    process.env.RESEND_FROM_EMAIL ||
    "DJ Visuals AI <onboarding@resend.dev>"
  );
}

export async function POST(request: Request) {
  let payload: GiftLeadPayload;

  try {
    payload = (await request.json()) as GiftLeadPayload;
  } catch {
    return NextResponse.json({ error: "Invalid payload." }, { status: 400 });
  }

  const name = String(payload.name || "").trim().slice(0, 80);
  const selectedPlan = String(payload.selectedPlan || "PROFESSIONAL").trim();
  const source = String(payload.source || "unknown").trim().slice(0, 80);

  if (!name) {
    return NextResponse.json({ error: "Name is required." }, { status: 400 });
  }

  if (!VALID_PLANS.has(selectedPlan)) {
    return NextResponse.json({ error: "Invalid plan." }, { status: 400 });
  }

  const recipients = getNotificationRecipients();

  if (!process.env.RESEND_API_KEY || recipients.length === 0) {
    return NextResponse.json({
      ok: true,
      skipped: true,
      reason: "Missing RESEND_API_KEY or notification recipient.",
    });
  }

  const resend = new Resend(process.env.RESEND_API_KEY);
  const submittedAt = new Date();

  try {
    await resend.emails.send({
      from: getFromEmail(),
      to: recipients,
      subject: `New welcome gift lead: ${name}`,
      html: `
        <div style="font-family:Arial,sans-serif;line-height:1.55;color:#111827">
          <h2 style="margin:0 0 12px">New welcome gift lead</h2>
          <p>A visitor entered their name and opened the discounted plans screen.</p>
          <table style="border-collapse:collapse;margin-top:16px">
            <tr>
              <td style="padding:6px 12px 6px 0;color:#6b7280">Name</td>
              <td style="padding:6px 0"><strong>${name}</strong></td>
            </tr>
            <tr>
              <td style="padding:6px 12px 6px 0;color:#6b7280">Selected plan</td>
              <td style="padding:6px 0"><strong>${selectedPlan}</strong></td>
            </tr>
            <tr>
              <td style="padding:6px 12px 6px 0;color:#6b7280">Source</td>
              <td style="padding:6px 0">${source}</td>
            </tr>
            <tr>
              <td style="padding:6px 12px 6px 0;color:#6b7280">Date</td>
              <td style="padding:6px 0">${submittedAt.toISOString()}</td>
            </tr>
          </table>
        </div>
      `,
      text: [
        "New welcome gift lead",
        "",
        `Name: ${name}`,
        `Selected plan: ${selectedPlan}`,
        `Source: ${source}`,
        `Date: ${submittedAt.toISOString()}`,
      ].join("\n"),
    });

    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error("gift lead email failed", error);

    return NextResponse.json({
      ok: true,
      emailFailed: true,
    });
  }
}
