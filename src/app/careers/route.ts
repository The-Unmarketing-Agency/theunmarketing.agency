import { NextResponse } from "next/server";

export async function GET(request: Request) {
  return NextResponse.redirect(new URL("/unmarketing-careers", request.url), 301);
}

export const HEAD = GET;
