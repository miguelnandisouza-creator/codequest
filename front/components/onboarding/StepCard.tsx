import { ReactNode } from "react";

type StepCardProps = {
  title: string;
  description: string;
  children: ReactNode;
};
  

export function StepCard({
  title,
  description,
  children,
}: StepCardProps) {
  return (
    <div className="w-full max-w-2xl rounded-3xl border border-zinc-800 bg-zinc-900 p-10 shadow-2xl">
      <h1 className="text-4xl font-bold">{title}</h1>


      <p className="mt-4 text-zinc-400">
        {description}
      </p>

      <div className="mt-8">
        {children}
      </div>
    </div>
  );
}