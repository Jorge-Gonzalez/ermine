// The same deliberately conservative literal-attribute boundary as D3:
// class/className with double quotes, single quotes, or an interpolation-free
// template literal. Dynamic expressions are invisible by design.

const CLASS_ATTRIBUTE = /(?:class|className)\s*=\s*(?:"([^"]*)"|'([^']*)'|\{\s*`([^`$]*)`\s*\})/g;

export interface ClassAttributeContext {
  valueStart: number;
  valueEnd: number;
  wordStart: number;
  wordEnd: number;
  word: string;
}

export interface ClassAttributeValue {
  attributeStart: number;
  valueStart: number;
  valueEnd: number;
  value: string;
  delimiter: '"' | "'" | "`";
}

export function classAttributeValues(text: string): ClassAttributeValue[] {
  const pattern = new RegExp(CLASS_ATTRIBUTE.source, CLASS_ATTRIBUTE.flags);
  const values: ClassAttributeValue[] = [];
  let match: RegExpExecArray | null;
  while ((match = pattern.exec(text))) {
    const value = match[1] ?? match[2] ?? match[3] ?? "";
    const delimiter = match[1] !== undefined ? '"' : match[2] !== undefined ? "'" : "`";
    const valueStart = match.index + match[0].indexOf(delimiter) + 1;
    values.push({ attributeStart: match.index, valueStart, valueEnd: valueStart + value.length, value, delimiter });
  }
  return values;
}

export function classAttributeContextAt(text: string, offset: number): ClassAttributeContext | null {
  for (const { valueStart, valueEnd } of classAttributeValues(text)) {
    if (offset < valueStart || offset > valueEnd) continue;

    let wordStart = Math.min(Math.max(offset, valueStart), valueEnd);
    let wordEnd = wordStart;
    while (wordStart > valueStart && !/\s/.test(text[wordStart - 1])) wordStart -= 1;
    while (wordEnd < valueEnd && !/\s/.test(text[wordEnd])) wordEnd += 1;
    return {
      valueStart,
      valueEnd,
      wordStart,
      wordEnd,
      word: text.slice(wordStart, wordEnd),
    };
  }
  return null;
}
