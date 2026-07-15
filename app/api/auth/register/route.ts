import { readStoredUsers, writeStoredUsers } from "@/infrastructure/auth/userStore";

export async function POST(request: Request) {
  const formData = await request.formData();
  const name = String(formData.get("name") ?? "").trim();
  const email = String(formData.get("email") ?? "").trim().toLowerCase();
  const password = String(formData.get("password") ?? "");
  const confirmPassword = String(formData.get("confirmPassword") ?? "");

  if (name.length < 2) {
    return authError("Digite um nome com pelo menos 2 letras.");
  }

  if (password.length < 6) {
    return authError("A senha precisa ter pelo menos 6 caracteres.");
  }

  if (password !== confirmPassword) {
    return authError("As senhas nao conferem.");
  }

  const users = await readStoredUsers();

  if (users.some((user) => user.email === email)) {
    return authError("Ja existe uma conta com esse email.");
  }

  const user = {
    id: crypto.randomUUID(),
    name,
    email,
    password,
    createdAt: new Date().toISOString(),
  };

  await writeStoredUsers([...users, user]);

  return authSuccess(user);
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

function authSuccess(user: {
  id: string;
  name: string;
  email: string;
  password: string;
  createdAt: string;
}) {
  const session = {
    userId: user.id,
    email: user.email,
    name: user.name,
    startedAt: new Date().toISOString(),
  };

  return new Response(
    `<!doctype html><meta charset="utf-8"><script>
      const user = ${JSON.stringify(user)};
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
