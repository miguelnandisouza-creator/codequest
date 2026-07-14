export type ValidationResult = {
  success: boolean;
  message: string;
};

export function validateAnswer(
  code: string,
  expectedAnswer: string
): ValidationResult {
  const normalize = (text: string) =>
    text
      .trim()
      .replace(/\s+/g, " ")
      .replace(/\s*;\s*$/, "")
      .toLowerCase();

  if (normalize(code) === normalize(expectedAnswer)) {
    return {
      success: true,
      message: "Resposta correta!",
    };
  }

  return {
    success: false,
    message: "Ainda nao esta correto. Confira o comando e o nome da tabela.",
  };
}
