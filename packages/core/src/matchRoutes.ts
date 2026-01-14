import { IRouteMatchResult } from "./components/types.js";
import { WcRoute } from "./components/WcRoute.js";
import { WcRoutes } from "./components/WcRoutes.js";

function _matchRoutes(
  routesNode: WcRoutes, 
  routeNode: WcRoute, 
  routes: WcRoute[], 
  path: string,
  results: IRouteMatchResult[]
): void {
  const nextRoutes = routes.concat(routeNode);
  const matchResult = routeNode.testPath(path);
  if (matchResult) {
    results.push(matchResult);
    return; // Stop searching deeper routes once a match is found
  }
  for(const childRoute of routeNode.routeChildNodes) {
    _matchRoutes(routesNode, childRoute, nextRoutes, path, results);
  }
}

export function matchRoutes(routesNode: WcRoutes, path: string): IRouteMatchResult | null {
  const routes: WcRoute[] = [];
  const topLevelRoutes = routesNode.routeChildNodes;
  const results: IRouteMatchResult[] = [];
  for (const route of topLevelRoutes) {
    _matchRoutes(routesNode, route, routes, path, results);
  }
  results.sort((a, b) => {
    const lastRouteA = a.routes.at(-1)!;
    const lastRouteB = b.routes.at(-1)!;
    const diffWeight = lastRouteA.absoluteWeight - lastRouteB.absoluteWeight;
    if (diffWeight !== 0) {
      return -diffWeight;
    }
    const diffIndex = lastRouteA.childIndex - lastRouteB.childIndex;
    return diffIndex;
  });
  if (results.length > 0) {
    return results[0];
  }
  return null;
}