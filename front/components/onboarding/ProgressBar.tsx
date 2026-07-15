type ProgressBarProps = {
  current: number;
  total: number;
};

export function ProgressBar({
  current,
  total,
}: ProgressBarProps) {
  const progress = ((current + 1) / total) * 100;

  return (
    <div className="mb-8">
      <div className="mb-2 flex justify-between font-mono text-xs uppercase tracking-[0.12em] text-[#93a4bd]">
        <span>Etapa {current + 1}</span>
        <span>{total}</span>
      </div>

      <div className="cq-progress w-full">
        <div
          className="cq-progress-fill transition-all duration-500"
          style={{ width: `${progress}%` }}
        />
      </div>
    </div>
  );
}
