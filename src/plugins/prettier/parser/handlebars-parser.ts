import { AstPath, Doc, Parser, Printer, SupportLanguage } from "prettier";
import * as handlebars from "@handlebars/parser";
import { builders } from "prettier/doc";
import concat = builders.concat;

function locStart(node: any) {
  return node.start;
}

function locEnd(node: any) {
  return node.end;
}

export const languages: Partial<SupportLanguage>[] = [
  {
    name: "handlebars",
    parsers: ["handlebarsParser"],
    extensions: [".handlebars", ".hbs", ".html"],
    vscodeLanguageIds: ["handlebars"],
  },
];

export const parsers: Record<string, Parser> = {
  handlebarsParser: {
    parse(text: string) {
      return handlebars.parse(text);
    },
    locStart,
    locEnd,
    astFormat: "handlebars-ast",
  },
};

const printer = (
  path: AstPath,
  options: object,
  print: (selector?: string | number | Array<string | number> | AstPath) => Doc
) => {
  const node = path.getValue();

  if (Array.isArray(node)) {
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    return path.map(print);
  }

  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
  // @ts-ignore
  return handlebars.print(node);
};

export const printers: Record<string, Printer> = {
  "handlebars-ast": {
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    print: printer,
  },
};
