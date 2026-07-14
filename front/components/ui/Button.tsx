type ButtonProps = {
  children: React.ReactNode;
  onClick?: () => void;
};

export function Button({ children, onClick }: ButtonProps) {
  return (
    <button
      onClick={onClick}
      className="rounded-xl bg-blue-600 px-8 py-4 text-lg font-semibold text-white transition-all duration-200 hover:scale-105 hover:bg-blue-500 active:scale-95"
    >
      {children}
    </button>
  );
}