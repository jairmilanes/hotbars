import { readFile } from "fs/promises";
import { basename } from "./path-helpers";

const templateName = (templatePath: string, namespace?: string): string => {
  const ext = templatePath.split(".").pop();
  const name = basename(templatePath, `.${ext}`);

  if (namespace) {
    return namespace + "/" + name;
  }

  return name;
};

export const loadTemplate = async (
  path: string,
  encoding: BufferEncoding = "utf-8"
): Promise<{ name: string; template: string } | undefined> => {
  const template = await readFile(path, {
    encoding,
  });

  return {
    name: templateName(path),
    template: template.toString(),
  };
};
