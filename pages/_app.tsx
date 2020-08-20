import { DarkTheme } from "@themes/DarkTheme";
import { Container, GlobalStyle } from "@themes/GlobalStyle";
import App from "next/app";
import { ThemeProvider } from "styled-components";

export default class MyApp extends App {
  render() {
    const { Component, pageProps } = this.props;
    return (
      <ThemeProvider theme={new DarkTheme()}>
        <GlobalStyle />
        <Container>
          <Component {...pageProps} />
        </Container>
      </ThemeProvider>
    );
  }
}
