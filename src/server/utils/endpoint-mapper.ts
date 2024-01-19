import slugify from "slugify";
import { RequestMethod, RouteLayer, RouteMap, RouterMap } from "../types";

export const slugifyPath = (path: string): string => {
  // Extra white space needed here to delimit the param removal regex starting with ":"
  return (
    slugify(`${path} `.replace(/\//g, " ").replace(/(:.*\s)/g, ""), {
      lower: true,
    }) || "/"
  );
};

const stripRegex = (regexp: RegExp): string => {
  return regexp
    .toString()
    .slice(0, regexp.toString().length - 12)
    .slice(3)
    .replace(/\\/g, "");
};

const sort = (groups: RouterMap) => {
  Object.keys(groups).forEach((endpoint) => {
    groups[endpoint].sort((endpointA, endpointB) => {
      if (endpointA.path > endpointB.path) {
        return -1;
      }

      if (endpointA.path < endpointB.path) {
        return 1;
      }

      return 0;
    });
  });
  return groups;
};

const group = (endpoints: RouteMap[]): RouterMap => {
  return endpoints.reduce<{ [key: string]: RouteMap[] }>((groups, endpoint) => {
    if (!Array.isArray(endpoint.slug)) {
      groups[endpoint.slug] = [];
    }

    groups[endpoint.slug].push(endpoint);

    return groups;
  }, {});
};

const mapMiddleware = (
  layer: RouteLayer,
  index: number,
  prefix?: string
): RouteMap[] => {
  const { name, regexp } = layer;
  const path = stripRegex(regexp);

  return [
    {
      index,
      type: "middleware",
      path,
      slug: slugifyPath(name),
      prefix,
    },
  ];
};

const mapRoute = (
  layer: RouteLayer,
  index: number,
  prefix?: string
): RouteMap[] => {
  const { route, keys } = layer;
  const path = `${route?.path}`;
  const methods = Object.keys(route?.methods || {}) as RequestMethod[];

  return [
    {
      index,
      type: "route",
      path,
      slug: slugifyPath(path as string),
      prefix,
      methods,
      params: keys,
    },
  ];
};

const mapRouter = (
  layer: RouteLayer,
  index: number,
  prefix?: string
): RouteMap[] => {
  const path = `${prefix || ""}${stripRegex(layer.regexp) || "/"}`;

  return [
    {
      index,
      type: "router",
      path,
      slug: slugifyPath(path),
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-ignore
      source: layer.handle._source,
      prefix,
      routes: mapRoutes(layer.handle?.stack as RouteLayer[], path),
    },
  ];
};

const mapStatic = (
  layer: RouteLayer,
  index: number,
  prefix?: string
): RouteMap[] => {
  const path = `${prefix || ""}${stripRegex(layer.regexp) || "/"}`;
  return [
    {
      index,
      type: "static",
      path,
      slug: slugifyPath(path),
      method: "GET",
    },
  ];
};

export const mapRoutes = (routeStack: RouteLayer[], prefix?: string) => {
  return routeStack.reduce<RouteMap[]>(
    (map: RouteMap[], layer: RouteLayer, index: number) => {
      switch (layer.name) {
        case "bound dispatch":
          return map.concat(mapRoute(layer, index, prefix));
        case "router":
          return map.concat(mapRouter(layer, index, prefix));
        case "serveStatic":
          return map.concat(mapStatic(layer, index, prefix));
        default:
          return map.concat(mapMiddleware(layer, index, prefix));
      }
    },
    []
  );
};

export const dedupeRoutes = (
  routes1: RouteMap[],
  routes2: RouteMap[]
): RouteMap[] => {
  return routes1.filter(
    (route) => !routes2.find((rt) => rt.slug === route.slug)
  );
};

export const mapEndpoints = (
  routeStack: RouteLayer[],
  from?: number
): RouterMap => {
  return sort(group(mapRoutes(routeStack)));
};
