import { DarkTheme } from "@themes/DarkTheme";
import { Container, GlobalStyle } from "@themes/GlobalStyle";
import "reflect-metadata";
import { ThemeProvider } from "styled-components";

export default function MyApp({ Component, pageProps }) {
  return (
    <ThemeProvider theme={DarkTheme}>
      <GlobalStyle />
      <Container>
        <Component {...pageProps} />
      </Container>
    </ThemeProvider>
  );
}
