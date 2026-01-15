import { IOutlet, IRouter } from "./components/types";
import { config } from "./config";
import { matchRoutes } from "./matchRoutes";
import { raiseError } from "./raiseError";
import { showRouteContent } from "./showRouteContent";

export async function applyRoute(routerNode: IRouter, outlet: IOutlet, fullPath: string): Promise<void> {
  const basename = routerNode.basename;
  const path = fullPath.startsWith(basename)
    ? fullPath.slice(basename.length)
    : fullPath;
  const matchResult = matchRoutes(routerNode, path);
  if (!matchResult) {
    raiseError(`${config.tagNames.router} No route matched for path: ${path}`);
  }
  try {
    const lastRoutes = outlet.lastRoutes;
    await showRouteContent(matchResult.routes, lastRoutes, matchResult.params);
  } finally {
    outlet.lastRoutes = matchResult.routes;
  }
}
