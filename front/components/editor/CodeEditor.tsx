"use client";

import Editor from "@monaco-editor/react";

type Props = {
  code: string;
  setCode: (value: string) => void;
  language?: string;
};

export function CodeEditor({
  code,
  setCode,
  language = "sql",
}: Props) {
  return (
    <Editor
      height="400px"
      defaultLanguage={language}
      language={language}
      theme="vs-dark"
      value={code}
      onChange={(value) => setCode(value || "")}
      options={{
        minimap: {
          enabled: false,
        },
        fontSize: 16,
        fontFamily: "Cascadia Code, Consolas, monospace",
        roundedSelection: true,
        automaticLayout: true,
      }}
    />
  );
}
