import glob from "glob";
import { logger } from "../services";
import { SafeObject } from "../../types";

const parsePath = (
  viewsPath: string,
  path: string,
  extname: string
): { route: string; view: string } => {
  const pathParts: string[] = path.replace(`${viewsPath}/`, "").split("/");
  const routeParts: string[] = [];
  const viewParts: string[] = [];

  pathParts.forEach((part) => {
    const name = part.replace(`.${extname}`, "");

    if (name.startsWith("[")) {
      // Path is a param, check for closing tag
      if (!name.endsWith("]")) {
        logger.warn(
          `------ Route ${path} is missing a closing tag "]", if not fixed it will not be dynamically interpreted.`
        );
        routeParts.push(`${name}]`);
      } else {
        const paramName = name.replace(/\[|\]/g, "");
        routeParts.push(`:${paramName}`);
      }
    } else if (name !== "index") {
      routeParts.push(name);
    }

    viewParts.push(name);
  });

  return {
    route: `/${routeParts.join("/")}`,
    view: viewParts.join("/"),
  };
};

const resolvePaths = (viewsPath: string, extname: string): string[] => {
  const paths = glob.sync([viewsPath, `/**/*.${extname}`].join(""), {
    nodir: true,
    cwd: process.cwd(),
  });

  if (!paths.length) {
    logger.info(
      `-- No views under "${viewsPath}" were found, routes generation aborted.`
    );
    return [];
  }

  return paths;
};

export const mapPages = (
  viewsPath: string,
  extname: string,
  callback: (route: string, view: string) => void
): SafeObject => {
  logger.debug("-- User views: ", `${viewsPath}/**/*.${extname}`);

  const paths = resolvePaths(viewsPath, extname);
  const pages: SafeObject = {};

  logger.debug(`-- Found ${paths.length} views under "${viewsPath}".`);

  paths.forEach((entry, index) => {
    const { route, view } = parsePath(viewsPath, entry, extname);
    pages[route] = view;

    callback(route, view);

    logger.debug(`---- "${route}" -> "${view}.${extname}"`);

    if (index === paths.length - 1) {
      if (!pages["/"]) {
        logger.warn(
          `------ Base route "/" with an "index" view was not found, your 
          app has no home page, to fix add an index.${extname} to your 
          ${viewsPath} directory, otherwise "/" will result in a 404 error.`
        );
      }

      logger.debug(`-- Auto routes done.`);
    }
  });

  return pages;
};
