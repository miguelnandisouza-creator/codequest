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
    <div className="mt-8 rounded-md border border-[#26384f] bg-[#070c15] p-5">
      <p className="cq-kicker mb-4 text-[#72e6a8]">
        Executando consulta...
      </p>

      <table className="w-full border-collapse">
        <tbody>
          {output.map((row, index) => (
            <tr key={index}>
              {row.map((cell, i) => (
                <td
                  key={i}
                  className="border border-[#26384f] px-4 py-2 text-[#dbe8ff]"
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
