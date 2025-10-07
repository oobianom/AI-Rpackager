/**
 * Extracts code blocks from a markdown string.
 * @param markdown The markdown string to parse.
 * @returns An array of objects, each containing the language and the code.
 */
export function parseCodeFromMarkdown(markdown: string): { lang: string; code: string }[] {
  const codeBlocks: { lang: string; code: string }[] = [];
  const regex = /```(\w*)\n([\s\S]*?)```/g;
  let match;
  while ((match = regex.exec(markdown)) !== null) {
    codeBlocks.push({
      lang: match[1] || 'plaintext',
      code: match[2].trim(),
    });
  }
  return codeBlocks;
}
