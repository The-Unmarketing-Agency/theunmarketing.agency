import { NextResponse } from "next/server";
import { sendContactEmail } from "@/lib/email";

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
  return value.replace(/[&<>\"']/g, (character) => {
    const entities: Record<string, string> = {
      "&": "&amp;",
      "<": "&lt;",
      ">": "&gt;",
      "'": "&#39;",
      "\"": "&quot;",
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

  // If AWS credentials are not configured, accept gracefully
  if (!process.env.AWS_ACCESS_KEY_ID || !process.env.AWS_SECRET_ACCESS_KEY) {
    console.warn("AWS SES credentials not configured. Contact enquiry received:", { firstName, lastName, email, phone });
    return NextResponse.json({ ok: true });
  }

  try {
    const result = await sendContactEmail({
      firstName,
      lastName,
      email,
      phone,
      message
    });

    if (!result.success) {
      throw new Error("Failed to send email via AWS SES");
    }

    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json(
      { ok: false, error: "We couldn't send your enquiry. Please try again shortly." },
      { status: 502 },
    );
  }
}