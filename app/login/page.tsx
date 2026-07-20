import AuthForm from "@/components/auth/AuthForm";
import LoginIntro from "@/components/auth/LoginIntro";

type Props = {
  searchParams: Promise<{
    error?: string | string[];
  }>;
};

export default async function LoginPage({ searchParams }: Props) {
  const errorMessage = getErrorMessage((await searchParams).error);

  return (
    <main className="cq-page flex items-center justify-center px-5 py-10">
      <section className="grid w-full max-w-5xl gap-6 md:grid-cols-[0.9fr_1.1fr]">
        <LoginIntro />
        <AuthForm mode="login" errorMessage={errorMessage} />
      </section>
    </main>
  );
}

function getErrorMessage(error?: string | string[]) {
  if (!error) {
    return undefined;
  }

  return Array.isArray(error) ? error[0] : error;
}
