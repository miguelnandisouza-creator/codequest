import PixelMentor from "@/components/adventure/PixelMentor";

type Props = {
  title: string;
  content: string;
  onNext: () => void;
  nextLabel: string;
};

export default function TextStep({
  title,
  content,
  onNext,
  nextLabel,
}: Props) {
  return (
    <PixelMentor
      title={title}
      content={content}
      onComplete={onNext}
      completeLabel={nextLabel}
    />
  );
}
