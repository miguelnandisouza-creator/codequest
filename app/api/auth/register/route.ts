import { createStoredUser } from "@/infrastructure/auth/userStore";
import { createSessionToken } from "@/infrastructure/auth/sessionToken";

export async function POST(request: Request) {
  const formData = await request.formData();
  const name = String(formData.get("name") ?? "").trim();
  const email = String(formData.get("email") ?? "").trim().toLowerCase();
  const password = String(formData.get("password") ?? "");
  const confirmPassword = String(formData.get("confirmPassword") ?? "");

  if (name.length < 2) {
    return authError(request, "Digite um nome com pelo menos 2 letras.");
  }

  if (password.length < 6) {
    return authError(request, "A senha precisa ter pelo menos 6 caracteres.");
  }

  if (password !== confirmPassword) {
    return authError(request, "As senhas nao conferem.");
  }

  let user;

  try {
    user = await createStoredUser({
      name,
      email,
      password,
    });
  } catch (error) {
    return authError(request, error instanceof Error ? error.message : "Nao foi possivel criar a conta.");
  }

  return authSuccess(user);
}

function authError(request: Request, message: string) {
  const url = new URL("/register", request.url);
  url.searchParams.set("error", message);

  return Response.redirect(url, 303);
}

function authSuccess(user: {
  id: string;
  name: string;
  email: string;
  createdAt: string;
}) {
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
      const user = ${JSON.stringify({
        id: user.id,
        name: user.name,
        email: user.email,
        password: "",
        createdAt: user.createdAt,
      })};
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
