import { createHmac, timingSafeEqual } from "crypto";

import { isAdminEmail } from "@/data/admin";

type SessionPayload = {
  userId: string;
  email: string;
  name: string;
  issuedAt: string;
};

const tokenMaxAgeMs = 1000 * 60 * 60 * 24 * 90;
const tokenHeaderName = "x-codequest-session-token";

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
  const token = request.headers.get(tokenHeaderName);
  const payload = verifySessionToken(token);

  if (payload && isAdminEmail(payload.email)) {
    return true;
  }

  if (process.env.VERCEL === "1") {
    return false;
  }

  const email = new URL(request.url).searchParams.get("adminEmail") ?? "";

  return isAdminEmail(email);
}

function sign(value: string) {
  return createHmac("sha256", getSessionSecret())
    .update(value)
    .digest("base64url");
}

function getSessionSecret() {
  return (
    process.env.CODEQUEST_SESSION_SECRET ??
    process.env.SUPABASE_SERVICE_ROLE_KEY ??
    process.env.NEXTAUTH_SECRET ??
    "codequest-local-dev-session-secret"
  );
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
