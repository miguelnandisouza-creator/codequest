import Image from "next/image";
import Link from "next/link";

const features = [
  {
    title: "Quest-Based",
    subtitle: "Learning",
    icon: "quest",
  },
  {
    title: "Bite-Sized",
    subtitle: "Lessons",
    icon: "book",
  },
  {
    title: "Track Your",
    subtitle: "Progress",
    icon: "progress",
  },
  {
    title: "Earn Rewards &",
    subtitle: "Level Up",
    icon: "reward",
  },
];

export default function Home() {
  return (
    <main className="min-h-screen bg-[#050914] px-4 py-8 text-[#eef4ff] md:px-8">
      <section className="relative mx-auto h-[calc(100vh-4rem)] min-h-[520px] max-h-[680px] max-w-[980px] overflow-hidden rounded-md border border-[#24344d] bg-[#0a1220] shadow-[0_0_0_1px_rgba(126,166,255,0.08),0_24px_80px_rgba(0,0,0,0.45)]">
        <div className="absolute inset-y-0 right-[-2%] w-[82%] md:right-[-1%] md:w-[78%]">
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

        <div className="relative z-10 flex h-full flex-col px-6 py-5 md:px-12 md:py-8">
          <header className="flex items-center justify-between gap-4 font-mono text-[10px] font-bold text-[#9eb7db]">
            <Link href="/" className="flex items-center gap-2 uppercase">
              <span className="relative size-4">
                <span className="absolute left-1 top-0 h-4 w-0.5 bg-[#b8cfff]" />
                <span className="absolute left-0 top-[7px] h-0.5 w-4 bg-[#b8cfff]" />
                <span className="absolute left-[7px] top-[3px] size-1 bg-[#5b8cff]" />
              </span>
              RPG Learn
            </Link>

            <nav className="hidden items-center gap-7 md:flex">
              <a href="#features" className="hover:text-white">Features</a>
              <Link href="/dashboard" className="hover:text-white">Modules</Link>
              <Link href="/profile" className="hover:text-white">About</Link>
              <Link
                href="/login"
                className="border border-[#45648d] px-3 py-1.5 text-white hover:border-[#7ea6ff]"
              >
                Login
              </Link>
            </nav>
          </header>

          <div className="flex flex-1 items-center pb-8 pt-8 md:pb-10">
            <div className="max-w-[34rem]">
              <h1 className="font-mono text-[clamp(2.45rem,5.4vw,4.15rem)] font-black uppercase leading-[1.02] tracking-[-0.02em] text-[#f3f7ff]">
                <span className="whitespace-nowrap">Level Up</span>
                <br />
                <span className="whitespace-nowrap">Your Skills.</span>
              </h1>

              <p className="mt-6 max-w-sm font-mono text-xs leading-6 text-[#b7c5da] md:text-sm">
                An RPG-inspired journey to learn, practice, and master new skills one quest at a time.
              </p>

              <div className="mt-7 flex flex-wrap gap-3">
                <Link
                  href="/onboarding"
                  className="inline-flex min-h-11 items-center gap-3 rounded border border-[#7ea6ff] bg-[#4a78dc] px-5 font-mono text-sm font-bold text-white hover:bg-[#5b8cff]"
                >
                  Begin Journey
                  <span>{">"}</span>
                </Link>

                <Link
                  href="/dashboard"
                  className="inline-flex min-h-11 items-center rounded border border-[#304662] bg-[#0b1424]/80 px-5 font-mono text-sm font-bold text-[#d7e4f8] hover:border-[#5b8cff] hover:text-white"
                >
                  How It Works
                </Link>
              </div>
            </div>
          </div>

          <div
            id="features"
            className="rounded-md border border-[#213149]/90 bg-[#050914]/34 px-4 py-5 backdrop-blur-[3px]"
          >
            <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
              {features.map((feature) => (
                <div
                  key={feature.title}
                  className="flex flex-col items-center text-center font-mono text-xs font-bold text-[#b9c9df]"
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
