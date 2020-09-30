import styled from "styled-components";

export const SocialList = styled.ul`
  grid-area: social;
  list-style: none;
  display: flex;
  margin: 0;
  padding: 0;
`;

export const SocialListItem = styled.li`
  grid-area: social;
  margin: 0 1rem;

  &:first-child {
    margin-left: 0;
  }

  &:last-child {
    margin-right: 0;
  }

  a {
    border-bottom: none;
    display: flex;
    align-items: center;
  }
`;
