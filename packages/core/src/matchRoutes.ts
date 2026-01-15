import { IRoute, IRouteMatchResult, IRouter } from "./components/types.js";

function _matchRoutes(
  routesNode: IRouter, 
  routeNode: IRoute, 
  routes: IRoute[], 
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

export function matchRoutes(routesNode: IRouter, path: string): IRouteMatchResult | null {
  const routes: IRoute[] = [];
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