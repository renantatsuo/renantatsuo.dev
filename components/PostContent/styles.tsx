import styled from "styled-components";

export const PostContainer = styled.article`
  display: flex;
  flex-direction: column;
  width: 100%;

  *:not(pre) code {
    background-color: var(--background-darker);
    padding: 0.2rem;
    border-radius: 0.3em;
  }
`;

export const PostHeader = styled.header`
  display: flex;
  flex-direction: column;
`;

export const PostTitle = styled.h1`
  margin: 0;
`;

export const PostDate = styled.small`
  color: var(--selected);
`;
