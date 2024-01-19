import { readFile } from "fs/promises";
import { basename } from "./path-helpers";
import { Config, DashboardConfig } from "../core";

const templateName = (templatePath: string, key?: string): string => {
  const ext = templatePath.split(".").pop();

  if (key) {
    const configKey = key === "partials" ? "shared" : "precompile"
    const basePath = Config.fullPath(configKey)
    const baseDashPath = DashboardConfig.fullPath(configKey)

    let diffPath;

    if (templatePath.startsWith(baseDashPath)) {
      diffPath = templatePath.replace(`${baseDashPath}/`, "")
    } else {
      diffPath = templatePath.replace(`${basePath}/`, "")
    }

    return diffPath.replace(`.${ext}`, "")
  }

  return basename(templatePath, `.${ext}`);
};

export const loadTemplate = async (
  path: string,
  encoding: BufferEncoding = "utf-8",
  key?: string
): Promise<{ name: string; template: string }> => {
  const template = await readFile(path, {
    encoding,
  });

  return {
    name: templateName(path, key),
    template: template.toString(),
  };
};
