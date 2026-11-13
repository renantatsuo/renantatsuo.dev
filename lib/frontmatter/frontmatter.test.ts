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

  it("Should strip single and double quotes", () => {
    const input = `---\ndouble: "a b"\nsingle: 'c d'\nempty: ""\n---\n`;

    expect(parseFrontMatter(input).data).toStrictEqual({
      double: "a b",
      single: "c d",
      empty: "",
    });
  });

  it("Should split on the first colon only", () => {
    const input = [
      "---",
      "title: Javascript Series - Typing: part 2",
      "url: https://example.com:8080/a",
      `quoted: "a: b"`,
      "---",
    ].join("\n");

    expect(parseFrontMatter(input).data).toStrictEqual({
      title: "Javascript Series - Typing: part 2",
      url: "https://example.com:8080/a",
      quoted: "a: b",
    });
  });

  it("Should skip blank lines and comment lines", () => {
    const input = "---\n# a comment\n\ntitle: test\n  # indented\n \n---\nbody";

    expect(parseFrontMatter(input)).toStrictEqual({
      data: { title: "test" },
      content: "body",
    });
  });

  it("Should keep every value as a string", () => {
    const input =
      "---\ncount: 5\ndraft: true\ndate: 2026-04-21\nnone: null\n---";

    expect(parseFrontMatter(input).data).toStrictEqual({
      count: "5",
      draft: "true",
      date: "2026-04-21",
      none: "null",
    });
  });

  it("Should trim whitespace around values", () => {
    expect(parseFrontMatter("---\ntitle:   padded  \n---").data).toStrictEqual({
      title: "padded",
    });
  });

  it.each([
    ["a top-level list", "- a\n- b", `line 2: "- a"`],
    ["a line with no key", "title: ok\njust text", `line 3: "just text"`],
    ["a nested mapping", "meta:\n  author: me", `line 2: "meta:"`],
    ["a block list", "tags:\n  - a", `line 2: "tags:"`],
    ["an indented entry", "title: ok\n  more: text", `line 3: "  more: text"`],
    ["a flow list", "tags: [a, b]", `line 2: "tags: [a, b]"`],
    ["a flow mapping", "meta: {a: b}", `line 2: "meta: {a: b}"`],
    ["a block scalar", "body: |", `line 2: "body: |"`],
    ["a key with no value", "title:", `line 2: "title:"`],
    [
      "a key with no space after the colon",
      "title:test",
      `line 2: "title:test"`,
    ],
    ["a key with spaces", "my title: test", `line 2: "my title: test"`],
    ["an unclosed quote", `title: "open`, `line 2: "title: "open"`],
    [
      "an escape in a quoted value",
      `title: "a\\nb"`,
      `line 2: "title: "a\\nb""`,
    ],
    ["an inline comment", "title: test # note", `line 2: "title: test # note"`],
    ["a duplicate key", "title: a\ntitle: b", `line 3: "title: b"`],
  ])("Should throw on %s", (_name, block, where) => {
    expect(() => parseFrontMatter(`---\n${block}\n---\nbody`)).toThrow(
      `Unsupported front matter on ${where}`,
    );
  });
});
