import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import theme from "../../themes/CodeHighlighterTheme";

type CodeHighlighterProps = {
  value: string | React.ReactNode[];
  inline: boolean;
  className: string;
};

function CodeHighlighter({ value, inline, className }: CodeHighlighterProps) {
  if (inline) {
    return <code className={className}>{value}</code>;
  }
  const language = /language-(\w+)/.exec(className ?? "");
  console.log(value);
  return (
    <SyntaxHighlighter language={language[1]} style={theme}>
      {String(value).replace(/\n$/, "")}
    </SyntaxHighlighter>
  );
}

export default CodeHighlighter;
