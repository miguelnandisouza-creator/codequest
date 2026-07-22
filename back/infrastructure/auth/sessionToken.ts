import { createHmac, timingSafeEqual } from "crypto";

import { isAdminEmail } from "@/data/admin";

type SessionPayload = {
  userId: string;
  email: string;
  name: string;
  issuedAt: string;
};

const tokenMaxAgeMs = 1000 * 60 * 60 * 24 * 90;
export const tokenHeaderName = "x-codequest-session-token";

export function createSessionToken(payload: SessionPayload) {
  const encodedPayload = encodeBase64Url(JSON.stringify(payload));
  const signature = sign(encodedPayload);

  return `${encodedPayload}.${signature}`;
}

export function verifySessionToken(token?: string | null) {
  if (!token) {
    return null;
  }

  const [encodedPayload, signature, extra] = token.split(".");

  if (!encodedPayload || !signature || extra) {
    return null;
  }

  if (!safeEqual(signature, sign(encodedPayload))) {
    return null;
  }

  try {
    const payload = JSON.parse(decodeBase64Url(encodedPayload)) as SessionPayload;
    const issuedAt = Date.parse(payload.issuedAt);

    if (!payload.userId || !payload.email || !payload.name || Number.isNaN(issuedAt)) {
      return null;
    }

    if (Date.now() - issuedAt > tokenMaxAgeMs) {
      return null;
    }

    return payload;
  } catch {
    return null;
  }
}

export function isAdminSessionRequest(request: Request) {
  const payload = getSessionRequestPayload(request);

  if (payload && isAdminEmail(payload.email)) {
    return true;
  }

  if (process.env.VERCEL === "1" || process.env.NODE_ENV === "production") {
    return false;
  }

  const email = new URL(request.url).searchParams.get("adminEmail") ?? "";

  return isAdminEmail(email);
}

export function isSessionUserRequest(request: Request, userId: string) {
  const payload = getSessionRequestPayload(request);

  return payload?.userId === userId;
}

export function getSessionRequestPayload(request: Request) {
  return verifySessionToken(request.headers.get(tokenHeaderName));
}

function sign(value: string) {
  return createHmac("sha256", getSessionSecret())
    .update(value)
    .digest("base64url");
}

function getSessionSecret() {
  const configuredSecret = process.env.CODEQUEST_SESSION_SECRET;

  if (configuredSecret) {
    return configuredSecret;
  }

  if (process.env.VERCEL === "1" || process.env.NODE_ENV === "production") {
    throw new Error("CODEQUEST_SESSION_SECRET is required in production.");
  }

  return "codequest-local-dev-session-secret";
}

function encodeBase64Url(value: string) {
  return Buffer.from(value, "utf8").toString("base64url");
}

function decodeBase64Url(value: string) {
  return Buffer.from(value, "base64url").toString("utf8");
}

function safeEqual(left: string, right: string) {
  const leftBuffer = Buffer.from(left);
  const rightBuffer = Buffer.from(right);

  return leftBuffer.length === rightBuffer.length && timingSafeEqual(leftBuffer, rightBuffer);
}
