const HOST = process.env.RAPIDAPI_FLIGHT_HOST || "sky-scrapper.p.rapidapi.com";

const RETRY_STATUS = new Set([429, 500, 502, 503, 504]);

export function rapidApiHost() {
  return HOST;
}

export function rapidApiHeaders() {
  return {
    "X-RapidAPI-Host": HOST,
    "X-RapidAPI-Key": process.env.RAPIDAPI_KEY!,
  };
}

export function rapidApiConfigured() {
  return Boolean(process.env.RAPIDAPI_KEY?.trim());
}

function retryDelayMs(attempt: number, retryAfterHeader: string | null) {
  if (retryAfterHeader) {
    const sec = parseInt(retryAfterHeader, 10);
    if (!Number.isNaN(sec) && sec > 0) return sec * 1000;
  }
  return 600 * 2 ** attempt + Math.floor(Math.random() * 250);
}

export async function rapidApiFetch(
  url: string,
  opts?: { timeoutMs?: number; retries?: number },
): Promise<Response> {
  const timeoutMs = opts?.timeoutMs ?? 22000;
  const retries = opts?.retries ?? 2;

  let lastError: unknown;

  for (let attempt = 0; attempt <= retries; attempt++) {
    try {
      const res = await fetch(url, {
        headers: rapidApiHeaders(),
        signal: AbortSignal.timeout(timeoutMs),
      });

      if (res.ok || !RETRY_STATUS.has(res.status) || attempt === retries) {
        return res;
      }

      await new Promise((r) => setTimeout(r, retryDelayMs(attempt, res.headers.get("retry-after"))));
    } catch (err) {
      lastError = err;
      if (attempt === retries) throw err;
      await new Promise((r) => setTimeout(r, retryDelayMs(attempt, null)));
    }
  }

  throw lastError instanceof Error ? lastError : new Error("RapidAPI request failed");
}
