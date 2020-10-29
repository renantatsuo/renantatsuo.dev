import styled, { createGlobalStyle } from "styled-components";

export const GlobalStyle = createGlobalStyle`
  *,
  *::before,
  *::after {
    box-sizing: border-box;
  }

  html, body {
    margin: 0;
    padding: 0;

    background-color: ${({ theme }) => theme.background};

    color: ${({ theme }) => theme.foregroundDarker};
    font: 110%/1.75 Literata, Georgia, serif;
  }

  #__next {
    display:flex;
    justify-content: center;
    max-width: 100vw;
  }

  ::selection {
    background: ${({ theme }) => theme.selected};
  }

  a {
    color: ${({ theme }) => theme.primary};
    text-decoration: none;
    border-bottom: 0.0625rem solid ${({ theme }) => theme.primary};
  }

  h1,h2,h3,h4,h5,h6 {
    color: var(--foreground);
    line-height: 120%;
  }

  @media (min-width: 801px) {
    h1 {
      font-size: 2.5rem;
    }

    h2 {
      font-size: 1.9rem;
    }

    h3 {
      font-size: 1.55rem;
    }

    h4 {
      font-size: 1.3rem;
    }

    h5 {
      font-size: 1.1rem;
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

  background-color: ${({ theme }) => theme.background};
`;
