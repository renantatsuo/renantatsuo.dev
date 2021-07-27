import styled from "styled-components";

export const PostPaginationContainer = styled.article`
  display: grid;
  grid-template: "next next" "prev prev";
  grid-row-gap: 1rem;
  justify-content: flex-end;
  width: 100%;
  font-size: 0.9rem;
  margin-top: 1rem;
  margin-bottom: 2rem;

  @media (min-width: 28rem) {
    grid-template: "next prev";
    justify-content: space-between;
  }
`;

type PostPaginationLinkProps = {
  position: "next" | "prev";
};

export const PostPaginationLink = styled.a<PostPaginationLinkProps>`
  grid-area: ${(props) => props.position};
  cursor: pointer;
  max-width: 11rem;
  border: none;

  @media (min-width: 46rem) {
    max-width: 22rem;
    margin: 0;
  }
`;
