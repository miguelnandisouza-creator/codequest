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
    <div className="cq-panel w-full max-w-2xl p-6 md:p-9">
      <p className="cq-kicker">Choose your path</p>
      <h1 className="cq-title mt-4 text-3xl md:text-4xl">{title}</h1>

      <p className="mt-4 text-sm leading-6 text-[#93a4bd] md:text-base">
        {description}
      </p>

      <div className="mt-8">
        {children}
      </div>
    </div>
  );
}
