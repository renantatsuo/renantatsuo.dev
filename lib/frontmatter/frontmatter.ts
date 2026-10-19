import { parse } from "yaml";

export type FrontMatter = {
  data: Record<string, unknown>;
  content: string;
};

const FRONT_MATTER_PATTERN = /^---\r?\n(?:([\s\S]*?)\r?\n)?---(?:\r?\n|$)/;

/**
 * Split a markdown document into its YAML front matter and content.
 *
 * @param input the markdown document
 */
export function parseFrontMatter(input: string): FrontMatter {
  const match = FRONT_MATTER_PATTERN.exec(input);
  if (!match) {
    return { data: {}, content: input };
  }

  const data: unknown = parse(match[1] ?? "") ?? {};
  if (typeof data !== "object" || Array.isArray(data)) {
    throw new Error("Front matter must be a YAML mapping");
  }

  return {
    data: data as Record<string, unknown>,
    content: input.slice(match[0].length),
  };
}
