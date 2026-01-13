import { WcRoute } from "./WcRoute.js";
import { WcRoutes } from "./WcRoutes.js";
import { config } from "../config.js";

export class WcOutlet extends HTMLElement {
  private _routesNode: WcRoutes | null = null;
  private _lastRoutes: WcRoute[] = [];
  constructor() {
    super();
    if (config.enableShadowRoot) {
      this.attachShadow({ mode: 'open' });
    }
  }

  get routesNode(): WcRoutes | null {
    return this._routesNode;
  }
  set routesNode(value: WcRoutes | null) {
    this._routesNode = value;
  }

  get rootNode(): HTMLElement | ShadowRoot {
    if (this.shadowRoot) {
      return this.shadowRoot;
    }
    return this;
  }

  showRouteContent(routes: WcRoute[], params: Record<string, string>): void {
    // Hide previous routes
    const routesSet = new Set<WcRoute>(routes);
    for (const route of this._lastRoutes) {
      if (!routesSet.has(route)) {
        route.hide();
      }
    }
    const lastRouteSet = new Set<WcRoute>(this._lastRoutes);
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
