import styled from "styled-components";

export const UserContainer = styled.div`
  display: grid;
  grid-template-areas: "avatar username" "avatar social";
  grid-auto-columns: auto 1fr;
  grid-auto-rows: 1fr 1fr;
  column-gap: 1rem;

  height: 60px;
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
  line-height: 100%;
  align-self: flex-start;
`;
