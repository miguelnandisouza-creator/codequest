type Props = {
  title: string;
  explanation: string;
  code: string;
  result: string;
  onNext: () => void;
  nextLabel: string;
};

export default function ExampleStep({
  title,
  explanation,
  code,
  result,
  onNext,
  nextLabel,
}: Props) {
  return (
    <>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h2 className="text-2xl font-bold">{title}</h2>

        <span className="rounded-full bg-blue-500/10 px-3 py-1 text-xs font-semibold uppercase tracking-[0.16em] text-blue-300">
          Exemplo
        </span>
      </div>

      <p className="mt-4">{explanation}</p>

      <pre className="mt-6 overflow-auto rounded-lg bg-black p-5">
        <code>{code}</code>
      </pre>

      <div className="mt-5 rounded-lg bg-zinc-800 p-4 text-green-400">
        {result}
      </div>

      <button
        onClick={onNext}
        className="mt-8 rounded-lg bg-blue-600 px-6 py-3 hover:bg-blue-700"
      >
        {nextLabel}
      </button>
    </>
  );
}
