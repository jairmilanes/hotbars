import glob from "glob";
import * as _ from "lodash";
import { logger } from "../../services";
import { SafeObject } from "../types";

const parsePath = (
  viewsPath: string,
  path: string,
  extname: string,
  securePath: string
): { route: string; view: string } => {
  const pathParts: string[] = path.replace(`${viewsPath}/`, "").split("/");
  const routeParts: string[] = [];
  const viewParts: string[] = [];

  pathParts.forEach((part) => {
    const name = part.replace(`.${extname}`, "");

    if (part === securePath) {
      return viewParts.push(name);
    }

    if (name.startsWith("[")) {
      // Path is a param, check for closing tag
      if (!name.endsWith("]")) {
        logger.warn(
          `%p%P Route ${path} is missing a closing tag "]", if not fixed it will not be dynamically interpreted.`,
          4,
          2
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
    logger.warn(
      `%p%P No views under "${viewsPath}" were found, auto-routes aborted.`,
      4,
      2
    );
    return [];
  }

  return paths;
};

export const mapPages = (
  viewsPath: string,
  extname: string,
  securePath: string,
  callback?: (route: string, view: string) => void
): SafeObject => {
  const paths = resolvePaths(viewsPath, extname);
  const pages: SafeObject = {};

  paths.forEach((entry, index) => {
    const { route, view } = parsePath(viewsPath, entry, extname, securePath);

    pages[route] = view;

    if (_.isFunction(callback)) {
      callback(route, view);
    }

    if (index === paths.length - 1) {
      if (!pages["/"]) {
        logger.warn(
          `%p%P Base route "/" with an "index" view was not found, your 
          app has no home page, to fix add an index.${extname} to your 
          ${viewsPath} directory, otherwise "/" will result in a 404 error.`,
          4,
          2
        );
      }
    }
  });

  return pages;
};
