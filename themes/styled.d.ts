import "styled-components";

/**
 * Theme colors specifications.
 */
declare module "styled-components" {
  export interface DefaultTheme {
    primary: string;
    background: string;
    backgroundDarker: string;
    foreground: string;
    foregroundDarker: string;
    selected: string;
    disabled: string;
    yellow: string;
    blue: string;
    green: string;
  }
}
