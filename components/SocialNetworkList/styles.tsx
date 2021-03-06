import styled from "styled-components";

export const SocialList = styled.ul`
  grid-area: social;
  list-style: none;
  display: flex;
  margin: 0;
  padding: 0;
  align-self: center;
`;

export const SocialListItem = styled.li`
  grid-area: social;
  margin: 0 0.2rem;

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

    > div {
      display: flex;
      height: 1.5rem;
    }
  }
`;
