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
      <div className="mb-2 flex justify-between text-sm text-zinc-400">
        <span>Etapa {current + 1}</span>
        <span>{total}</span>
      </div>

      <div className="h-3 w-full rounded-full bg-zinc-800">
        <div
          className="h-3 rounded-full bg-blue-600 transition-all duration-500"
          style={{ width: `${progress}%` }}
        />
      </div>
    </div>
  );
}