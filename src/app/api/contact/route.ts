import { NextResponse } from "next/server";
import { Resend } from "resend";

export const runtime = "nodejs";

type ContactPayload = {
  name?: unknown;
  lastName?: unknown;
  email?: unknown;
  phone?: unknown;
  message?: unknown;
  website?: unknown;
};

function field(value: unknown, maxLength: number) {
  return typeof value === "string" ? value.trim().slice(0, maxLength) : "";
}

function escapeHtml(value: string) {
  return value.replace(/[&<>'"]/g, (character) => {
    const entities: Record<string, string> = {
      "&": "&amp;",
      "<": "&lt;",
      ">": "&gt;",
      "'": "&#39;",
      '"': "&quot;",
    };
    return entities[character];
  });
}

function recipients(value: string | undefined) {
  return value
    ?.split(",")
    .map((address) => address.trim())
    .filter(Boolean);
}

export async function POST(request: Request) {
  const contentLength = Number(request.headers.get("content-length") || 0);
  if (contentLength > 12_000) {
    return NextResponse.json({ ok: false, error: "Submission is too large." }, { status: 413 });
  }

  let payload: ContactPayload;
  try {
    payload = (await request.json()) as ContactPayload;
  } catch {
    return NextResponse.json({ ok: false, error: "Invalid submission." }, { status: 400 });
  }

  const firstName = field(payload.name, 120);
  const lastName = field(payload.lastName, 120);
  const email = field(payload.email, 254);
  const phone = field(payload.phone, 40);
  const message = field(payload.message, 5000);
  const website = field(payload.website, 200);

  // Honeypot spam protection: silent accept if filled
  if (website) return NextResponse.json({ ok: true });

  if (
    !firstName ||
    !lastName ||
    !phone ||
    message.length < 10 ||
    !/^[^\s@]+@[^\s@]+\.[^\s@]+$/u.test(email)
  ) {
    return NextResponse.json({ ok: false, error: "Please complete all required fields." }, { status: 400 });
  }

  const resendApiKey = process.env.RESEND_API_KEY?.trim();
  if (!resendApiKey) {
    // If email delivery service is not configured in local environment, accept gracefully
    console.warn("RESEND_API_KEY not configured. Contact enquiry received:", { firstName, lastName, email, phone });
    return NextResponse.json({ ok: true });
  }

  const to = recipients(process.env.CONTACT_TO_EMAIL) || ["hello@theunmarketing.agency"];
  const cc = recipients(process.env.CONTACT_CC_EMAIL) || ["gladwyn.lewis@gmail.com"];
  const from =
    process.env.CONTACT_FROM_EMAIL?.trim() ||
    "The Unmarketing Agency <hello@theunmarketing.agency>";
  const name = [firstName, lastName].filter(Boolean).join(" ");
  const safeName = escapeHtml(name);
  const safeEmail = escapeHtml(email);
  const safePhone = escapeHtml(phone);
  const safeMessage = escapeHtml(message).replace(/\n/g, "<br />");
  const subjectName = name.replace(/[\r\n]+/g, " ");

  try {
    const resend = new Resend(resendApiKey);
    const result = await resend.emails.send({
      cc,
      from,
      html: `<h1>New contact enquiry</h1><p><strong>Name:</strong> ${safeName}</p><p><strong>Email:</strong> ${safeEmail}</p>${safePhone ? `<p><strong>Phone:</strong> ${safePhone}</p>` : ""}<p><strong>Message:</strong><br />${safeMessage}</p>`,
      replyTo: email,
      subject: `New contact enquiry from ${subjectName}`,
      text: `New contact enquiry\n\nName: ${name}\nEmail: ${email}${phone ? `\nPhone: ${phone}` : ""}\n\nMessage:\n${message}`,
      to,
    });
    if (result.error) throw new Error("Resend rejected the message.");
    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json(
      { ok: false, error: "We couldn’t send your enquiry. Please try again shortly." },
      { status: 502 },
    );
  }
}
