import { NextResponse } from "next/server";

function redirectRenamedThought(request: Request) {
  const destination = new URL("/thoughts/should-i-use-ai-for-branding", request.url);
  return NextResponse.redirect(destination, 301);
}

export const GET = redirectRenamedThought;
export const HEAD = redirectRenamedThought;
