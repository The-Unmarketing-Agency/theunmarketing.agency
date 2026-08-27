import { NextResponse } from "next/server";

type RouteContext = { params: Promise<{ slug: string }> };

async function redirectLegacyProject(request: Request, context: RouteContext) {
  const { slug } = await context.params;
  const destination = new URL(`/work/${encodeURIComponent(slug)}`, request.url);
  return NextResponse.redirect(destination, 301);
}

export const GET = redirectLegacyProject;
export const HEAD = redirectLegacyProject;
