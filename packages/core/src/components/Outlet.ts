import { config } from "../config.js";
import { raiseError } from "../raiseError.js";
import { IOutlet, IRoute, IRouter } from "./types.js";

export class Outlet extends HTMLElement implements IOutlet {
  private _routesNode: IRouter | null = null;
  private _lastRoutes: IRoute[] = [];
  constructor() {
    super();
    if (config.enableShadowRoot) {
      this.attachShadow({ mode: 'open' });
    }
  }

  get routesNode(): IRouter {
    if (!this._routesNode) {
      raiseError(`${config.tagNames.outlet} has no routesNode.`);
    }
    return this._routesNode;
  }
  set routesNode(value: IRouter) {
    this._routesNode = value;
  }

  get rootNode(): HTMLElement | ShadowRoot {
    if (this.shadowRoot) {
      return this.shadowRoot;
    }
    return this;
  }

  showRouteContent(routes: IRoute[], params: Record<string, string>): void {
    // Hide previous routes
    const routesSet = new Set<IRoute>(routes);
    for (const route of this._lastRoutes) {
      if (!routesSet.has(route)) {
        route.hide();
      }
    }
    const lastRouteSet = new Set<IRoute>(this._lastRoutes);
    for (const route of routes) {
      if (!lastRouteSet.has(route)) {
        route.show(params);
      }
    }
    this._lastRoutes = [ ...routes ];
  }

  connectedCallback() {
//    console.log('WcOutlet connectedCallback');
  }
}

export function createOutlet(): Outlet {
  return document.createElement(config.tagNames.outlet) as Outlet;
}
