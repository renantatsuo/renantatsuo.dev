import { mock } from "vitest-mock-extended";
import { FileSystem } from "~/lib/filesystem/FileSystem";
import Posts from "~/lib/post/Posts";

const fsMock = mock<FileSystem>();
const PostsInstance = new Posts(fsMock);

describe("Test getPosts()", () => {
  it("Should return no posts", async () => {
    fsMock.listFiles.mockResolvedValueOnce([]);

    expect(await PostsInstance.getPosts()).toStrictEqual([]);
  });

  it("Should return [2] posts", async () => {
    const FILENAME = "filename";
    fsMock.listFiles.mockResolvedValueOnce([FILENAME, FILENAME]);
    fsMock.readFile.mockResolvedValue(Buffer.of());

    expect(await PostsInstance.getPosts()).toHaveLength(2);
  });
});

describe("Test getPost()", () => {
  it("Should return specific post", async () => {
    const FILENAME = "filename";
    const postString = [
      "---",
      "title: test post",
      "slug: test-post",
      `createdAt: "1970-01-01"`,
      "---",
      "this is a test post",
    ].join("\n");
    fsMock.readFile.mockResolvedValueOnce(Buffer.from(postString));

    const expectedPost: Post = {
      title: "test post",
      slug: "test-post",
      createdAt: "1970-01-01",
      content: "this is a test post",
      excerpt: "this is a test post...",
      keywords: [],
    };

    expect(await PostsInstance.getPost(FILENAME)).toStrictEqual(expectedPost);
  });
});
