interface ApiErrorPayload {
  message?: unknown;
  title?: unknown;
  errors?: unknown;
}

function firstValidationError(errors: unknown): string | null {
  if (!errors || typeof errors !== "object") return null;

  for (const value of Object.values(errors as Record<string, unknown>)) {
    if (Array.isArray(value) && typeof value[0] === "string") return value[0];
    if (typeof value === "string") return value;
  }

  return null;
}

export async function getApiErrorMessage(response: Response, fallback: string): Promise<string> {
  const text = await response.text().catch(() => "");
  if (!text) return fallback;

  try {
    const payload = JSON.parse(text) as ApiErrorPayload;
    if (typeof payload.message === "string" && payload.message.trim()) {
      return payload.message;
    }

    const validationError = firstValidationError(payload.errors);
    if (validationError) return validationError;

    if (typeof payload.title === "string" && payload.title.trim()) {
      return payload.title;
    }
  } catch {
    return text;
  }

  return fallback;
}
