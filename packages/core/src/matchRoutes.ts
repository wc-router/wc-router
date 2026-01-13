import { IRouteMatchResult } from "./components/types.js";
import { WcRoute } from "./components/WcRoute.js";
import { WcRoutes } from "./components/WcRoutes.js";

function _matchRoutes(routesNode: WcRoutes, routeNode: WcRoute, routes: WcRoute[], path: string): IRouteMatchResult | null {
  const nextRoutes = routes.concat(routeNode);
  const matchResult = routeNode.testPath(path);
  if (matchResult) {
    return matchResult;
  }
  if (routeNode.routeChildNodes.length === 0) {
    return null;
  }
  for(const childRoute of routeNode.routeChildNodes) {
    const matchedRoutes = _matchRoutes(routesNode, childRoute, nextRoutes, path);
    if (matchedRoutes) {
      return matchedRoutes;
    }
  }
  return null;
}

export function matchRoutes(routesNode: WcRoutes, path: string): IRouteMatchResult | null {
  const routes: WcRoute[] = [];
  const topLevelRoutes = routesNode.routeChildNodes;
  for (const route of topLevelRoutes) {
    const matchedRoutes = _matchRoutes(routesNode, route, routes, path);
    if (matchedRoutes) {
      return matchedRoutes;
    }
  }
  return null;
}