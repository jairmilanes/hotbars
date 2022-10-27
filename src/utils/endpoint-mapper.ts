import { RequestMethod, RouteLayer, RouteMap, RouterMap } from "../types";
import slugify from "slugify";

const slugifyPath = (path: string): string => {
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
    .slice(2)
    .replace(/\\/g, "");
};

const sort = (groups: RouterMap) => {
  Object.keys(groups).forEach((endpoint) => {
    groups[endpoint].sort((endpointA, endpointB) => {
      if (endpointA.description > endpointB.description) {
        return -1;
      }

      if (endpointA.description < endpointB.description) {
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

const mapStack = (routeStack: RouteLayer[], prefix?: string): RouteMap[] => {
  return routeStack.reduce<RouteMap[]>((map: RouteMap[], layer: RouteLayer) => {
    const { keys, route, name, regexp } = layer;
    // /^\/store\/here\/?(?=\/|$)/i
    if (name === "router") {
      const subRoutes = mapStack(
        layer.handle?.stack as RouteLayer[],
        stripRegex(regexp)
      );

      return map.concat(subRoutes);
    } else if (route && route.path) {
      const methods = Object.keys(route.methods || {});

      return map.concat(
        methods.map<RouteMap>((method) => {
          return {
            name,
            path: route?.path,
            slug: slugifyPath(route.path),
            method: method.toUpperCase() as RequestMethod,
            description: `${method.toUpperCase()} ${prefix || ""}${
              route?.path
            }`,
            params: keys,
          };
        })
      );
    } else if (name === "serveStatic") {
      const path = stripRegex(regexp) || "/";
      map.push({
        name: "",
        path,
        slug: slugifyPath(path),
        method: "GET",
        description: `STATIC ${path}`,
        params: [],
      });
    }

    return map;
  }, []);
};

export const mapEndpoints = (routeStack: RouteLayer[]): RouterMap => {
  return sort(group(mapStack(routeStack)));
};
