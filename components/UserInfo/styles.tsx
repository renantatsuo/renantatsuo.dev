import styled from "styled-components";

export const UserContainer = styled.div`
  display: grid;
  grid-template-areas: "avatar username" "avatar social";
  grid-auto-columns: auto 1fr;
  grid-auto-rows: 1fr 1fr;
  row-gap: 0.5rem;
  column-gap: 1rem;

  height: 80px;
  width: 100%;
  margin: 2rem 0;
`;

export const UserAvatar = styled.img`
  grid-area: avatar;

  max-height: 100%;
  border-radius: 50%;
`;

export const Username = styled.h2`
  grid-area: username;
  margin: 0;
  font-size: 1.25rem;
  align-self: flex-end;
`;

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
