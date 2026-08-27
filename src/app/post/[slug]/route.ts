import { NextResponse } from "next/server";

type RouteContext = { params: Promise<{ slug: string }> };

async function redirectLegacyPost(request: Request, context: RouteContext) {
  const { slug } = await context.params;
  const destination = new URL(`/thoughts/${encodeURIComponent(slug)}`, request.url);
  return NextResponse.redirect(destination, 301);
}

export const GET = redirectLegacyPost;
export const HEAD = redirectLegacyPost;
