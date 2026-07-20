import Image from "next/image";
import Link from "next/link";

const features = [
  {
    title: "Missoes",
    subtitle: "guiadas",
    icon: "quest",
  },
  {
    title: "Aulas",
    subtitle: "curtas",
    icon: "book",
  },
  {
    title: "Progresso",
    subtitle: "salvo",
    icon: "progress",
  },
  {
    title: "Loja",
    subtitle: "e ranking",
    icon: "reward",
  },
];

export default function Home() {
  return (
    <main className="min-h-screen overflow-x-hidden bg-[#050914] px-3 py-8 text-[#eef4ff] sm:px-4 md:px-8">
      <section className="relative mx-auto h-auto min-h-[760px] w-full max-w-[980px] overflow-hidden rounded-md border border-[#24344d] bg-[#0a1220] shadow-[0_0_0_1px_rgba(126,166,255,0.08),0_24px_80px_rgba(0,0,0,0.45)] md:h-[calc(100vh-4rem)] md:min-h-[520px] md:max-h-[680px]">
        <div className="absolute inset-y-0 right-0 hidden w-[82%] sm:block md:right-[-1%] md:w-[78%]">
          <Image
            src="/assets/hero-rpg-learn.png"
            alt=""
            fill
            sizes="780px"
            className="object-contain object-center opacity-95 [image-rendering:pixelated]"
            priority
          />
        </div>

        <div className="absolute inset-0 bg-[linear-gradient(90deg,rgba(5,9,20,0.97)_0%,rgba(6,12,24,0.90)_35%,rgba(6,12,24,0.24)_68%,rgba(5,9,20,0.42)_100%)]" />
        <div className="absolute inset-x-0 bottom-0 h-44 bg-[linear-gradient(180deg,transparent,rgba(5,9,20,0.80)_72%,rgba(5,9,20,0.96))]" />
        <div className="absolute inset-2 rounded border border-[#37506f]/45" />

        <div className="relative z-10 flex h-full min-w-0 flex-col px-5 py-5 md:px-12 md:py-8">
          <header className="flex items-center justify-between gap-4 font-mono text-[10px] font-bold text-[#9eb7db]">
            <Link href="/" className="flex items-center gap-2 uppercase">
              <span className="relative size-4">
                <span className="absolute left-1 top-0 h-4 w-0.5 bg-[#b8cfff]" />
                <span className="absolute left-0 top-[7px] h-0.5 w-4 bg-[#b8cfff]" />
                <span className="absolute left-[7px] top-[3px] size-1 bg-[#5b8cff]" />
              </span>
              CodeQuest
            </Link>

            <nav className="hidden items-center gap-7 md:flex">
              <a href="#features" className="hover:text-white">Recursos</a>
              <Link href="/dashboard" className="hover:text-white">Campanhas</Link>
              <Link href="/profile" className="hover:text-white">Cursos</Link>
              <Link
                href="/login"
                className="border border-[#45648d] px-3 py-1.5 text-white hover:border-[#7ea6ff]"
              >
                Login
              </Link>
            </nav>
          </header>

          <div className="flex min-w-0 flex-1 items-center pb-8 pt-8 md:pb-10">
            <div className="w-full min-w-0 max-w-[19rem] md:max-w-[34rem]">
              <h1 className="font-mono text-[clamp(1.9rem,8.2vw,2.45rem)] font-black uppercase leading-[1.08] text-[#f3f7ff] md:hidden">
                <span className="block">Aprenda</span>
                <span className="block">codigo</span>
                <br />
                <span className="block">em modo RPG.</span>
              </h1>

              <h1 className="hidden font-mono text-[clamp(2.45rem,5.4vw,4.15rem)] font-black uppercase leading-[1.04] text-[#f3f7ff] md:block">
                <span className="whitespace-nowrap">Aprenda codigo</span>
                <br />
                <span className="whitespace-nowrap">em modo RPG.</span>
              </h1>

              <p className="mt-6 max-w-[28ch] break-words font-mono text-xs leading-6 text-[#b7c5da] sm:max-w-sm md:text-sm">
                Aprenda SQL, JavaScript, Python, Java e C# com missoes, chefes, recompensas e progresso salvo.
              </p>

              <div className="mt-7 flex flex-col gap-3 sm:flex-row sm:flex-wrap">
                <Link
                  href="/onboarding"
                  className="inline-flex min-h-11 w-full items-center justify-center gap-3 rounded border border-[#7ea6ff] bg-[#4a78dc] px-3 text-center font-mono text-xs font-bold text-white hover:bg-[#5b8cff] sm:w-auto sm:px-5 sm:text-sm"
                >
                  Comecar jornada
                  <span>{">"}</span>
                </Link>

                <Link
                  href="/dashboard"
                  className="inline-flex min-h-11 w-full items-center justify-center rounded border border-[#304662] bg-[#0b1424]/80 px-3 text-center font-mono text-xs font-bold text-[#d7e4f8] hover:border-[#5b8cff] hover:text-white sm:w-auto sm:px-5 sm:text-sm"
                >
                  Ver campanhas
                </Link>
              </div>
            </div>
          </div>

          <div
            id="features"
            className="max-w-[19rem] rounded-md border border-[#213149]/90 bg-[#050914]/34 px-3 py-5 backdrop-blur-[3px] sm:px-4 md:max-w-none"
          >
            <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
              {features.map((feature) => (
                <div
                  key={feature.title}
                  className="min-w-0 break-words flex flex-col items-center text-center font-mono text-xs font-bold text-[#b9c9df]"
                >
                  <FeatureIcon type={feature.icon} />
                  <span className="mt-3 text-[#cfe0f8]">{feature.title}</span>
                  <span>{feature.subtitle}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}

function FeatureIcon({ type }: { type: string }) {
  if (type === "quest") {
    return (
      <span className="relative block size-8">
        <span className="absolute left-[13px] top-1 h-7 w-1 rotate-45 bg-[#8fb4e8]" />
        <span className="absolute left-[13px] top-1 h-7 w-1 -rotate-45 bg-[#8fb4e8]" />
        <span className="absolute left-2 top-5 h-1 w-4 bg-[#d4a67e]" />
      </span>
    );
  }

  if (type === "book") {
    return (
      <span className="relative block size-8">
        <span className="absolute left-1 top-2 h-5 w-3 border border-[#d7b08a] bg-[#6c4b36]" />
        <span className="absolute right-1 top-2 h-5 w-3 border border-[#d7b08a] bg-[#8a684b]" />
        <span className="absolute left-[15px] top-1 h-7 w-0.5 bg-[#f0d2aa]" />
      </span>
    );
  }

  if (type === "progress") {
    return (
      <span className="flex size-8 items-end justify-center gap-1">
        <span className="h-3 w-1.5 bg-[#5b8cff]" />
        <span className="h-5 w-1.5 bg-[#7fb0ff]" />
        <span className="h-7 w-1.5 bg-[#9ec0ff]" />
      </span>
    );
  }

  return (
    <span className="relative block size-8">
      <span className="absolute left-1 top-3 h-4 w-6 border border-[#d7b08a] bg-[#5c3d2b]" />
      <span className="absolute left-0 top-2 h-2 w-8 bg-[#8a5d38]" />
      <span className="absolute left-[14px] top-2 h-5 w-1 bg-[#e7c66a]" />
      <span className="absolute left-2 top-5 h-1 w-4 bg-[#c6934d]" />
    </span>
  );
}
