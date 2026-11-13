export type FrontMatter = {
  data: Record<string, unknown>;
  content: string;
};

const FRONT_MATTER_PATTERN = /^---\r?\n(?:([\s\S]*?)\r?\n)?---(?:\r?\n|$)/;
const BLANK_OR_COMMENT_PATTERN = /^\s*(?:#|$)/;
const ENTRY_PATTERN = /^([\w-]+):\s+(.+)$/;
const QUOTED_PATTERN = /^(?:"([^"\\]*)"|'([^']*)')$/;
/** Unquoted values YAML would not read as their literal text. */
const NOT_PLAIN_PATTERN = /^[,[\]{}#&*!|>'"%@`]|^[-?:](?:\s|$)|\s#/;

/**
 * Split a markdown document into its front matter and content.
 *
 * Front matter is a flat list of `key: value` strings, optionally quoted;
 * any other YAML syntax throws.
 *
 * @param input the markdown document
 */
export function parseFrontMatter(input: string): FrontMatter {
  const match = FRONT_MATTER_PATTERN.exec(input);
  if (!match) {
    return { data: {}, content: input };
  }

  return {
    data: parseEntries(match[1] ?? ""),
    content: input.slice(match[0].length),
  };
}

/**
 * Parse the `key: value` lines of a front matter block.
 *
 * @param block the text between the front matter delimiters
 */
function parseEntries(block: string): Record<string, string> {
  const entries = new Map<string, string>();

  for (const [index, raw] of block.split(/\r?\n/).entries()) {
    const line = raw.trimEnd();
    if (BLANK_OR_COMMENT_PATTERN.test(line)) {
      continue;
    }

    const entry = ENTRY_PATTERN.exec(line);
    const value = entry ? parseValue(entry[2]) : undefined;
    if (!entry || value === undefined || entries.has(entry[1])) {
      throw new Error(
        `Unsupported front matter on line ${index + 2}: "${line}" (only unique, flat "key: value" strings are supported)`,
      );
    }
    entries.set(entry[1], value);
  }

  return Object.fromEntries(entries);
}

/**
 * Read a scalar value, stripping its quotes.
 *
 * @param value the trimmed text after the key
 * @returns the string, or undefined when the syntax is unsupported
 */
function parseValue(value: string): string | undefined {
  const quoted = QUOTED_PATTERN.exec(value);
  if (quoted) {
    return quoted[1] ?? quoted[2];
  }
  return NOT_PLAIN_PATTERN.test(value) ? undefined : value;
}
