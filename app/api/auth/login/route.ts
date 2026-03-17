import { NextResponse } from "next/server";
import { CMS_API_BASE_URL } from "../../../lib/cms";

export async function POST(req: Request) {
  const body = await req.json();

  const res = await fetch(`${CMS_API_BASE_URL}/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });

  const data = await res.json();

  return NextResponse.json(data, { status: res.status });
}

