import { WcRoute } from "./components/WcRoute.js";
import { WcRoutes } from "./components/WcRoutes.js";

function _matchRoutes(routesNode: WcRoutes, routeNode: WcRoute, routes: WcRoute[], path: string): WcRoute[] | null {
  const nextRoutes = routes.concat(routeNode);
  if (routeNode.testPath(path)) {
    return nextRoutes;
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

export function matchRoutes(routesNode: WcRoutes, path: string): WcRoute[] {
  const routes: WcRoute[] = [];
  const topLevelRoutes = routesNode.routeChildNodes;
  for (const route of topLevelRoutes) {
    const matchedRoutes = _matchRoutes(routesNode, route, routes, path);
    if (matchedRoutes) {
      return matchedRoutes;
    }
  }
  return [];
}