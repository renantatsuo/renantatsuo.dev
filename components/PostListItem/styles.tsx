import styled from "styled-components";

export const PostListItemContainer = styled.article`
  display: flex;
  flex-direction: column;
`;

export const PostListItemHeader = styled.header`
  display: flex;
  flex-direction: column;
`;

export const PostListItemTitle = styled.h2`
  margin: 0;

  a {
    color: ${({ theme }) => theme.yellow};
    border: none;
  }
`;

export const PostListItemDate = styled.small`
  color: ${({ theme }) => theme.selected};
`;

export const PostListItemContent = styled.p`
  margin: 0.5rem 0;
`;
