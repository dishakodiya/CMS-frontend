import { NextResponse, type NextRequest } from "next/server";
import { CMS_API_BASE_URL } from "../../../lib/cms";

type Ctx = { params: Promise<{ path: string[] }> };

export const dynamic = "force-dynamic";

async function forward(req: NextRequest, ctx: Ctx) {
  const { path } = await ctx.params;
  const incomingUrl = new URL(req.url);

  const targetUrl = new URL(`${CMS_API_BASE_URL}/${path.join("/")}`);
  targetUrl.search = incomingUrl.search;

  const headers = new Headers(req.headers);
  headers.delete("host");
  headers.delete("connection");
  headers.delete("content-length");

  const method = req.method.toUpperCase();
  const body =
    method === "GET" || method === "HEAD" ? undefined : await req.arrayBuffer();

  let upstream: Response;
  try {
    upstream = await fetch(targetUrl.toString(), {
      method,
      headers,
      body,
      cache: "no-store",
      redirect: "manual",
    });
  } catch {
    return NextResponse.json(
      { error: "Unable to reach CMS server." },
      { status: 502 },
    );
  }

  const resHeaders = new Headers();
  const contentType = upstream.headers.get("content-type");
  if (contentType) resHeaders.set("content-type", contentType);

  if (upstream.status === 204) {
    return new NextResponse(null, {
      status: upstream.status,
      headers: resHeaders,
    });
  }

  const buf = await upstream.arrayBuffer();
  return new NextResponse(buf, { status: upstream.status, headers: resHeaders });
}

export function GET(req: NextRequest, ctx: Ctx) {
  return forward(req, ctx);
}
export function POST(req: NextRequest, ctx: Ctx) {
  return forward(req, ctx);
}
export function PATCH(req: NextRequest, ctx: Ctx) {
  return forward(req, ctx);
}
export function PUT(req: NextRequest, ctx: Ctx) {
  return forward(req, ctx);
}
export function DELETE(req: NextRequest, ctx: Ctx) {
  return forward(req, ctx);
}
