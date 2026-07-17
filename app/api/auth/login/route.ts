import { findStoredUserByCredentials } from "@/infrastructure/auth/userStore";
import { createSessionToken } from "@/infrastructure/auth/sessionToken";

export async function POST(request: Request) {
  const formData = await request.formData();
  const email = String(formData.get("email") ?? "").trim().toLowerCase();
  const password = String(formData.get("password") ?? "");
  const user = await findStoredUserByCredentials(email, password);

  if (!user) {
    return authError("Email ou senha invalidos.");
  }

  const sessionData = {
    userId: user.id,
    email: user.email,
    name: user.name,
    startedAt: new Date().toISOString(),
  };
  const session = {
    ...sessionData,
    sessionToken: createSessionToken({
      userId: sessionData.userId,
      email: sessionData.email,
      name: sessionData.name,
      issuedAt: sessionData.startedAt,
    }),
  };

  return new Response(
    `<!doctype html><meta charset="utf-8"><script>
      const user = ${JSON.stringify(toClientUser(user))};
      const session = ${JSON.stringify(session)};
      const usersKey = "codequest-users";
      const currentUsers = JSON.parse(localStorage.getItem(usersKey) || "[]");
      const nextUsers = [...currentUsers.filter((item) => item.id !== user.id), user];
      localStorage.setItem(usersKey, JSON.stringify(nextUsers));
      localStorage.setItem("codequest-session", JSON.stringify(session));
      location.replace("/dashboard");
    </script>`,
    {
      headers: {
        "content-type": "text/html; charset=utf-8",
      },
    }
  );
}

function toClientUser(user: {
  id: string;
  name: string;
  email: string;
  createdAt: string;
}) {
  return {
    id: user.id,
    name: user.name,
    email: user.email,
    password: "",
    createdAt: user.createdAt,
  };
}

function authError(message: string) {
  return new Response(
    `<!doctype html><meta charset="utf-8"><script>alert(${JSON.stringify(message)});history.back();</script>`,
    {
      headers: {
        "content-type": "text/html; charset=utf-8",
      },
    }
  );
}
