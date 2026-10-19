import { parseFrontMatter } from "~/lib/frontmatter/frontmatter";

describe("Test parseFrontMatter()", () => {
  it("Should parse data and content", () => {
    const input = [
      "---",
      "title: test post",
      `createdAt: "1970-01-01"`,
      "keywords: a, b",
      "---",
      "this is a test post",
      "",
      "second paragraph",
    ].join("\n");

    expect(parseFrontMatter(input)).toStrictEqual({
      data: { title: "test post", createdAt: "1970-01-01", keywords: "a, b" },
      content: "this is a test post\n\nsecond paragraph",
    });
  });

  it("Should handle CRLF line endings", () => {
    const input = "---\r\ntitle: crlf\r\n---\r\nbody\r\n";

    expect(parseFrontMatter(input)).toStrictEqual({
      data: { title: "crlf" },
      content: "body\r\n",
    });
  });

  it("Should handle empty front matter", () => {
    expect(parseFrontMatter("---\n---\nbody")).toStrictEqual({
      data: {},
      content: "body",
    });
  });

  it("Should handle front matter with no content", () => {
    expect(parseFrontMatter("---\ntitle: only\n---")).toStrictEqual({
      data: { title: "only" },
      content: "",
    });
  });

  it("Should return the whole input as content without front matter", () => {
    expect(parseFrontMatter("# heading\nbody")).toStrictEqual({
      data: {},
      content: "# heading\nbody",
    });
  });

  it("Should return empty data and content for empty input", () => {
    expect(parseFrontMatter("")).toStrictEqual({ data: {}, content: "" });
  });

  it("Should not treat an unclosed delimiter as front matter", () => {
    expect(parseFrontMatter("---\ntitle: open\nbody")).toStrictEqual({
      data: {},
      content: "---\ntitle: open\nbody",
    });
  });

  it("Should throw when front matter is not a mapping", () => {
    expect(() => parseFrontMatter("---\n- a\n- b\n---\nbody")).toThrow(
      "Front matter must be a YAML mapping",
    );
  });
});
