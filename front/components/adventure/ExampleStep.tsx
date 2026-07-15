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
        <h2 className="cq-title text-2xl">{title}</h2>

        <span className="cq-badge">
          Exemplo
        </span>
      </div>

      <p className="mt-4 leading-7 text-[#c8d3e3]">{explanation}</p>

      <pre className="mt-6 overflow-auto rounded-md border border-[#26384f] bg-[#070c15] p-5 text-[#dbe8ff]">
        <code>{code}</code>
      </pre>

      <div className="mt-5 rounded-md border border-[#72e6a8]/30 bg-[#72e6a8]/10 p-4 text-[#b8ffd1]">
        {result}
      </div>

      <button
        onClick={onNext}
        className="cq-button mt-8"
      >
        {nextLabel}
      </button>
    </>
  );
}
