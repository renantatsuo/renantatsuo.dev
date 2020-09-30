import styled, { createGlobalStyle } from "styled-components";
import { Theme } from "./Theme";

export const GlobalStyle = createGlobalStyle`
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

    background-color: var(--background);

    color: var(--foreground);
    font: 110%/1.75 Literata, Georgia, serif;
  }

  #__next {
    display:flex;
    justify-content: center;
  }

  ::selection {
    background: var(--selected);
  }

  a {
    color: var(--primary);
    text-decoration: none;
    border-bottom: 0.0625rem solid var(--primary);
  }

  @media (min-width: 801px) {
    h1 {
      font-size: 3rem;
    }

    h2 {
      font-size: 2.25rem;
    }

    h3 {
      font-size: 1.75rem;
    }

    h4 {
      font-size: 1.5rem;
    }

    h5 {
      font-size: 1.25rem;
    }

    h6 {
      font-size: 1rem;
    }
  }
`;

export const Container = styled.main`
  width: 100%;
  max-width: 46.25rem;
  padding: 1rem;

  display: flex;
  align-items: flex-start;
  flex-direction: column;
  row-gap: 2rem;

  background-color: var(--background);
`;
