import { revalidateTag } from "next/cache";
import { NextResponse } from "next/server";

type SanityWebhookBody = {
  _type?: string;
  slug?: { current?: string } | string;
};

function constantTimeEqual(left: string, right: string) {
  if (left.length !== right.length) return false;
  let mismatch = 0;
  for (let index = 0; index < left.length; index += 1) {
    mismatch |= left.charCodeAt(index) ^ right.charCodeAt(index);
  }
  return mismatch === 0;
}

export async function POST(request: Request) {
  const secret = process.env.SANITY_REVALIDATE_SECRET;
  const authorization = request.headers.get("authorization") || "";
  const providedSecret = authorization.startsWith("Bearer ")
    ? authorization.slice("Bearer ".length)
    : "";

  if (!secret || !providedSecret || !constantTimeEqual(secret, providedSecret)) {
    return NextResponse.json({ revalidated: false }, { status: 401 });
  }

  let body: SanityWebhookBody;
  try {
    body = (await request.json()) as SanityWebhookBody;
  } catch {
    return NextResponse.json({ revalidated: false, error: "Invalid JSON" }, { status: 400 });
  }

  const type = body._type?.trim();
  const slug = typeof body.slug === "string" ? body.slug : body.slug?.current;

  if (!type) {
    return NextResponse.json({ revalidated: false, error: "Missing document type" }, { status: 400 });
  }

  revalidateTag(type, "max");
  revalidateTag("sitemap", "max");
  if (slug) revalidateTag(`${type}:${slug}`, "max");
  if (type === "faqItem") {
    revalidateTag("page", "max");
    revalidateTag("landingPage", "max");
    revalidateTag("thought", "max");
  }

  return NextResponse.json({ revalidated: true, type, slug: slug || null });
}
