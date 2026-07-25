import { NextRequest, NextResponse } from "next/server";

// Phase 1 placeholder: validates and logs the message.
// Phase 2: send via Resend/SMTP, and/or save to the database so it shows up in /admin.
export async function POST(req: NextRequest) {
  const body = await req.json();
  const { name, email, subject, message } = body;

  if (!name || !email || !subject || !message) {
    return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
  }

  // TODO(phase 2): persist to DB + send email notification to the brand owner.
  console.log("New contact message:", body);

  return NextResponse.json({ ok: true });
}
