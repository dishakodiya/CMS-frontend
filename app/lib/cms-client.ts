export class CmsApiError extends Error {
  status: number;
  details?: unknown;

  constructor(message: string, status: number, details?: unknown) {
    super(message);
    this.name = "CmsApiError";
    this.status = status;
    this.details = details;
  }
}

function extractErrorMessage(data: unknown) {
  if (!data || typeof data !== "object") return null;
  if (!("error" in data)) return null;
  const errorValue = (data as { error?: unknown }).error;
  if (typeof errorValue === "string") return errorValue;
  if (errorValue === null || errorValue === undefined) return null;
  return String(errorValue);
}

type CmsFetchOptions = {
  method?: string;
  token?: string | null;
  body?: unknown;
  signal?: AbortSignal;
};

export async function cmsFetchJson<T>(
  path: string,
  { method = "GET", token, body, signal }: CmsFetchOptions = {},
): Promise<T> {
  const headers: Record<string, string> = {
    Accept: "application/json",
  };

  if (body !== undefined) {
    headers["Content-Type"] = "application/json";
  }

  const authToken = token ?? localStorage.getItem("cms_token");
  if (authToken) {
    headers.Authorization = `Bearer ${authToken}`;
  }

  const res = await fetch(`/api/cms${path}`, {
    method,
    headers,
    body: body === undefined ? undefined : JSON.stringify(body),
    signal,
  });

  const text = await res.text();
  const data = (() => {
    try {
      return text ? (JSON.parse(text) as unknown) : null;
    } catch {
      return text;
    }
  })();

  if (!res.ok) {
    const msg = extractErrorMessage(data) ?? `Request failed (${res.status})`;
    throw new CmsApiError(msg, res.status, data);
  }

  return data as T;
}
