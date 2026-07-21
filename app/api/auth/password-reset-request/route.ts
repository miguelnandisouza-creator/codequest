import { createPasswordResetRequest } from "@/infrastructure/auth/passwordResetRequests";

export async function POST(request: Request) {
  const formData = await request.formData();
  const email = String(formData.get("email") ?? "").trim().toLowerCase();
  const requestedPassword = String(formData.get("requestedPassword") ?? "");
  const confirmPassword = String(formData.get("confirmPassword") ?? "");

  if (!email) {
    return redirectWithMessage(request, "Informe o email da conta.");
  }

  if (requestedPassword.length < 6) {
    return redirectWithMessage(request, "A nova senha precisa ter pelo menos 6 caracteres.");
  }

  if (requestedPassword !== confirmPassword) {
    return redirectWithMessage(request, "As senhas nao conferem.");
  }

  try {
    await createPasswordResetRequest(email, requestedPassword);
  } catch {
    return redirectWithMessage(request, "Nao foi possivel enviar a solicitacao agora.");
  }

  return redirectWithMessage(
    request,
    "Solicitacao enviada. Se o email existir, o admin vai analisar a troca."
  );
}

function redirectWithMessage(request: Request, message: string) {
  const url = new URL("/login", request.url);
  url.searchParams.set("reset", message);

  return Response.redirect(url, 303);
}
