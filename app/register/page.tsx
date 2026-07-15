import AuthForm from "@/components/auth/AuthForm";
import LoginIntro from "@/components/auth/LoginIntro";

export default function RegisterPage() {
  return (
    <main className="cq-page flex items-center justify-center px-5 py-10">
      <section className="grid w-full max-w-5xl gap-6 md:grid-cols-[0.9fr_1.1fr]">
        <LoginIntro />
        <AuthForm mode="register" />
      </section>
    </main>
  );
}
