import styled from "styled-components";

export const PostContainer = styled.article`
  width: 100%;

  *:not(pre) code {
    background-color: ${({ theme }) => theme.backgroundDarker};
    padding: 0.2rem;
    border-radius: 0.3em;
  }

  table {
    border-collapse: collapse;

    td {
      border: 2px solid ${({ theme }) => theme.selected};
      padding: 0.4rem 0.8rem;
    }
  }
`;

export const PostHeader = styled.header`
  display: flex;
  flex-direction: column;
`;

export const PostTitle = styled.h1`
  margin: 0;
  color: ${({ theme }) => theme.yellow};
`;

export const PostDate = styled.small`
  color: ${({ theme }) => theme.selected};
`;
