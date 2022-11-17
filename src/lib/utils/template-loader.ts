import { readFile } from "fs/promises";
import { logger } from "../services";
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
  templatePath: string,
  encoding: BufferEncoding = "utf-8"
): Promise<{ name: string; template: string }> => {
  try {
    const template = await readFile(templatePath, {
      encoding,
    });
    const name = templateName(templatePath);
    return { name, template: template.toString() };
  } catch (err) {
    logger.warn(`-- View ${templatePath} could not be found.`);
    throw err;
  }
};
