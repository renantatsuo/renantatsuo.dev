import { createGlobalStyle } from "styled-components";
import { Theme } from "./Theme";

export const Style = createGlobalStyle`
  :root {
    ${({ theme }: { theme: Theme }) => {
      return `
        --primary: ${theme.primary};
        --background: ${theme.background};
        --foreground: ${theme.foreground};
        --selected: ${theme.selected};
        --disabled: ${theme.disabled};
        --yellow: ${theme.yellow};
        --blue: ${theme.blue};
        --green: ${theme.green};
      `;
    }}
  }

  *,
  *::before,
  *::after {
    box-sizing: border-box;
  }

  html, body {
    margin: 0;
    padding: 0;
    width: 100vw;
    min-height: 100vh;
    
    display: flex;
    justify-content: center;

    background-color: var(--background);

    color: var(--foreground);
    font-size: 100%;
    font-family: Literata, Georgia, 'Times New Roman', Times, serif;
  }

  ::selection {
    background: var(--selected);
  }

  a {
    color: var(--primary);
    text-decoration: none;
    border-bottom: 1px solid var(--primary);
  }
`;

export default function Themed({
  children,
  theme,
}: {
  children: any;
  theme: Theme;
}) {
  return (
    <>
      <Style theme={theme} />
      {children}
    </>
  );
}
