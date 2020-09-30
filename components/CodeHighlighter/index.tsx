import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import theme from "./theme";

type CodeHighlighterProps = {
  value: string;
  language: string;
};

export default function CodeHighlighter({
  language,
  value,
}: CodeHighlighterProps) {
  return (
    <SyntaxHighlighter language={language} style={theme}>
      {value}
    </SyntaxHighlighter>
  );
}
