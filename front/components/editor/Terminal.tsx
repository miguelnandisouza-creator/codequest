type Props = {
  output: string[][];
  visible: boolean;
};

export default function Terminal({
  output,
  visible,
}: Props) {
  if (!visible) return null;

  return (
    <div className="mt-8 rounded-xl bg-black p-5">
      <p className="mb-4 text-green-400">
        Executando consulta...
      </p>

      <table className="w-full border-collapse">
        <tbody>
          {output.map((row, index) => (
            <tr key={index}>
              {row.map((cell, i) => (
                <td
                  key={i}
                  className="border border-zinc-700 px-4 py-2"
                >
                  {cell}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}