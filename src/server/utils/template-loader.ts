import { readFile } from "fs/promises";
import { basename } from "./path-helpers";
import { getServerViewPath } from "./server-view-path";

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
  encoding: BufferEncoding = "utf-8",
  fromServer?: boolean
): Promise<{ name: string; template: string } | undefined> => {
  try {
    const realPath = !fromServer ? path : getServerViewPath(path);

    if (realPath) {
      const template = await readFile(realPath, {
        encoding,
      });

      return {
        name: templateName(path),
        template: template.toString(),
      };
    }
  } catch (e) {
    if (!fromServer) {
      return loadTemplate(path, encoding, true);
    }
  }
};
