import AuthForm from "@/components/auth/AuthForm";
import LoginIntro from "@/components/auth/LoginIntro";

type Props = {
  searchParams: Promise<{
    error?: string | string[];
    reset?: string | string[];
  }>;
};

export default async function LoginPage({ searchParams }: Props) {
  const params = await searchParams;
  const errorMessage = getSearchMessage(params.error);
  const resetMessage = getSearchMessage(params.reset);

  return (
    <main className="cq-page flex items-center justify-center px-5 py-10">
      <section className="grid w-full max-w-5xl gap-6 md:grid-cols-[0.9fr_1.1fr]">
        <LoginIntro />
        <AuthForm mode="login" errorMessage={errorMessage} resetMessage={resetMessage} />
      </section>
    </main>
  );
}

function getSearchMessage(message?: string | string[]) {
  if (!message) {
    return undefined;
  }

  return Array.isArray(message) ? message[0] : message;
}
