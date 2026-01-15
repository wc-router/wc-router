import { IRoute } from "./components/types";

export function showRouteContent(routes: IRoute[], lastRoutes: IRoute[], params: Record<string, string>): void {
  // Hide previous routes
  const routesSet = new Set<IRoute>(routes);
  for (const route of lastRoutes) {
    if (!routesSet.has(route)) {
      route.hide();
    }
  }
  const lastRouteSet = new Set<IRoute>(lastRoutes);
  let force = false;
  for (const route of routes) {
    if (!lastRouteSet.has(route) || route.shouldChange(params) || force) {
      force = route.show(params);
    }
  }
}
