export interface ParsedCssDeclaration {
  file: string;
  selector: string;
  context: string[];
  property: string;
  value: string;
  line: number;
}

function stripComments(source: string): string {
  return source.replace(/\/\*[\s\S]*?\*\//g, (comment) => comment.replace(/[^\n]/g, " "));
}

function lineAt(source: string, offset: number): number {
  let line = 1;
  for (let index = 0; index < offset; index += 1) {
    if (source.charCodeAt(index) === 10) line += 1;
  }
  return line;
}

interface ScanState {
  quote: string | null;
  escaped: boolean;
  parentheses: number;
  brackets: number;
}

function advanceState(character: string, state: ScanState): void {
  if (state.quote) {
    if (state.escaped) state.escaped = false;
    else if (character === "\\") state.escaped = true;
    else if (character === state.quote) state.quote = null;
    return;
  }
  if (character === '"' || character === "'") state.quote = character;
  else if (character === "(") state.parentheses += 1;
  else if (character === ")") state.parentheses = Math.max(0, state.parentheses - 1);
  else if (character === "[") state.brackets += 1;
  else if (character === "]") state.brackets = Math.max(0, state.brackets - 1);
}

function matchingBrace(source: string, opening: number, end: number): number {
  const state: ScanState = { quote: null, escaped: false, parentheses: 0, brackets: 0 };
  let depth = 1;
  for (let index = opening + 1; index < end; index += 1) {
    const character = source[index];
    if (state.quote) {
      advanceState(character, state);
      continue;
    }
    advanceState(character, state);
    if (state.quote || state.parentheses || state.brackets) continue;
    if (character === "{") depth += 1;
    else if (character === "}") {
      depth -= 1;
      if (depth === 0) return index;
    }
  }
  return -1;
}

function topLevelColon(source: string): number {
  const state: ScanState = { quote: null, escaped: false, parentheses: 0, brackets: 0 };
  for (let index = 0; index < source.length; index += 1) {
    const character = source[index];
    if (!state.quote && !state.parentheses && !state.brackets && character === ":") return index;
    advanceState(character, state);
  }
  return -1;
}

function declarationSegments(body: string, bodyOffset: number): Array<{ text: string; offset: number }> {
  const segments: Array<{ text: string; offset: number }> = [];
  const state: ScanState = { quote: null, escaped: false, parentheses: 0, brackets: 0 };
  let nestedBraces = 0;
  let start = 0;
  for (let index = 0; index <= body.length; index += 1) {
    const character = body[index] ?? ";";
    if (!state.quote && !state.parentheses && !state.brackets) {
      if (character === "{") nestedBraces += 1;
      else if (character === "}") nestedBraces = Math.max(0, nestedBraces - 1);
      else if (character === ";" && nestedBraces === 0) {
        segments.push({ text: body.slice(start, index), offset: bodyOffset + start });
        start = index + 1;
        continue;
      }
    }
    advanceState(character, state);
  }
  return segments;
}

function isContainerAtRule(prelude: string): boolean {
  return /^@(media|supports|container|layer|scope|document|keyframes|-webkit-keyframes|starting-style)\b/i.test(prelude);
}

function normalize(value: string): string {
  return value.replace(/\s+/g, " ").trim();
}

function parseDeclarations(
  source: string,
  file: string,
  selector: string,
  context: string[],
  bodyStart: number,
  bodyEnd: number,
  output: ParsedCssDeclaration[],
): void {
  const body = source.slice(bodyStart, bodyEnd);
  for (const segment of declarationSegments(body, bodyStart)) {
    const trimmed = segment.text.trim();
    if (!trimmed || trimmed.includes("{")) continue;
    const colon = topLevelColon(trimmed);
    if (colon < 1) continue;
    const property = trimmed.slice(0, colon).trim().toLowerCase();
    if (!/^--[a-z0-9_-]+$/i.test(property) && !/^-?[a-z][a-z0-9-]*$/i.test(property)) continue;
    const value = normalize(trimmed.slice(colon + 1));
    if (!value) continue;
    const leading = segment.text.indexOf(trimmed);
    output.push({
      file,
      selector: normalize(selector),
      context: context.map(normalize),
      property,
      value,
      line: lineAt(source, segment.offset + Math.max(0, leading)),
    });
  }
}

function parseRange(
  source: string,
  file: string,
  start: number,
  end: number,
  context: string[],
  output: ParsedCssDeclaration[],
): void {
  const state: ScanState = { quote: null, escaped: false, parentheses: 0, brackets: 0 };
  let statementStart = start;
  let index = start;
  while (index < end) {
    const character = source[index];
    if (!state.quote && !state.parentheses && !state.brackets) {
      if (character === ";") {
        statementStart = index + 1;
        index += 1;
        continue;
      }
      if (character === "{") {
        const prelude = source.slice(statementStart, index).trim();
        const close = matchingBrace(source, index, end);
        if (close < 0) return;
        if (prelude) {
          if (isContainerAtRule(prelude)) {
            parseRange(source, file, index + 1, close, [...context, prelude], output);
          } else {
            parseDeclarations(source, file, prelude, context, index + 1, close, output);
            parseRange(source, file, index + 1, close, [...context, prelude], output);
          }
        }
        statementStart = close + 1;
        index = close + 1;
        continue;
      }
    }
    advanceState(character, state);
    index += 1;
  }
}

export function parseCssDeclarations(css: string, file: string): ParsedCssDeclaration[] {
  const source = stripComments(css);
  const output: ParsedCssDeclaration[] = [];
  parseRange(source, file, 0, source.length, [], output);
  return output;
}

export function displaySelector(declaration: ParsedCssDeclaration): string {
  return declaration.context.length
    ? `${declaration.context.join(" > ")} > ${declaration.selector}`
    : declaration.selector;
}
