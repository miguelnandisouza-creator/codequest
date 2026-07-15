type ButtonProps = {
  children: React.ReactNode;
  onClick?: () => void;
};

export function Button({ children, onClick }: ButtonProps) {
  return (
    <button
      onClick={onClick}
      className="cq-button"
    >
      {children}
    </button>
  );
}
