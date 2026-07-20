import { NextRequest, NextResponse } from "next/server";

const maintenanceEnabled = process.env.CODEQUEST_MAINTENANCE === "1";

export function proxy(request: NextRequest) {
  if (!maintenanceEnabled) {
    return NextResponse.next();
  }

  const { pathname } = request.nextUrl;

  if (isPublicAsset(pathname) || canBypassMaintenance(pathname)) {
    return NextResponse.next();
  }

  if (pathname.startsWith("/api/")) {
    return NextResponse.json(
      {
        error: "CodeQuest esta em manutencao. Tente novamente em alguns minutos.",
      },
      {
        status: 503,
        headers: {
          "retry-after": "300",
        },
      }
    );
  }

  return new NextResponse(getMaintenanceHtml(), {
    status: 503,
    headers: {
      "content-type": "text/html; charset=utf-8",
      "retry-after": "300",
    },
  });
}

export const config = {
  matcher: "/:path*",
};

function isPublicAsset(pathname: string) {
  return (
    pathname.startsWith("/_next/") ||
    pathname.startsWith("/assets/") ||
    pathname.startsWith("/uploads/") ||
    pathname === "/favicon.ico" ||
    pathname.endsWith(".svg") ||
    pathname.endsWith(".png") ||
    pathname.endsWith(".jpg") ||
    pathname.endsWith(".jpeg") ||
    pathname.endsWith(".webp") ||
    pathname.endsWith(".mp4") ||
    pathname.endsWith(".ico")
  );
}

function canBypassMaintenance(pathname: string) {
  return (
    pathname === "/login" ||
    pathname === "/admin" ||
    pathname === "/api/auth/login" ||
    pathname.startsWith("/api/admin/")
  );
}

function getMaintenanceHtml() {
  return `<!doctype html>
<html lang="pt-BR">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <title>CodeQuest em manutencao</title>
    <meta name="robots" content="noindex" />
    <style>
      :root {
        color-scheme: dark;
        --bg: #050914;
        --panel: #0a1220;
        --line: #26384f;
        --text: #f3f7ff;
        --muted: #93a4bd;
        --accent: #72e6a8;
        --blue: #5b8cff;
      }

      * {
        box-sizing: border-box;
      }

      body {
        margin: 0;
        min-height: 100vh;
        display: grid;
        place-items: center;
        background:
          linear-gradient(180deg, rgba(91, 140, 255, 0.12), transparent 34%),
          var(--bg);
        color: var(--text);
        font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono", monospace;
      }

      main {
        width: min(92vw, 720px);
        border: 1px solid var(--line);
        background: color-mix(in srgb, var(--panel) 92%, black);
        padding: clamp(24px, 6vw, 48px);
        box-shadow: 0 24px 90px rgba(0, 0, 0, 0.45);
      }

      .mark {
        width: 56px;
        height: 56px;
        display: grid;
        place-items: center;
        border: 1px solid #6f91d8;
        background: #101827;
        color: var(--accent);
        font-weight: 900;
        margin-bottom: 28px;
      }

      p.kicker {
        margin: 0;
        color: var(--accent);
        font-size: 12px;
        font-weight: 900;
        letter-spacing: 0.12em;
        text-transform: uppercase;
      }

      h1 {
        margin: 14px 0 0;
        font-size: clamp(36px, 8vw, 72px);
        line-height: 0.95;
        text-transform: uppercase;
      }

      p {
        margin: 22px 0 0;
        max-width: 58ch;
        color: var(--muted);
        line-height: 1.7;
      }

      .bar {
        margin-top: 34px;
        height: 10px;
        border: 1px solid var(--line);
        background: #07101d;
        overflow: hidden;
      }

      .fill {
        width: 42%;
        height: 100%;
        background: linear-gradient(90deg, var(--blue), var(--accent));
        animation: loading 1.8s ease-in-out infinite alternate;
      }

      @keyframes loading {
        from { transform: translateX(-35%); }
        to { transform: translateX(150%); }
      }
    </style>
  </head>
  <body>
    <main>
      <div class="mark">CQ</div>
      <p class="kicker">CodeQuest</p>
      <h1>Em manutencao</h1>
      <p>
        Estamos atualizando o reino para liberar melhorias nas aulas e no sistema.
        Volte em alguns minutos.
      </p>
      <div class="bar" aria-hidden="true">
        <div class="fill"></div>
      </div>
    </main>
  </body>
</html>`;
}
