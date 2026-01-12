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

  showRouteContent(routes: WcRoute[]) {
    // Hide previous routes
    const routesSet = new Set<WcRoute>(routes);
    for (const route of this._lastRoutes) {
      if (!routesSet.has(route)) {
        route.hide();
      }
    }
    for (const route of routes) {
      const parentNode = route.placeHolder.parentNode;
      const nextSibling = route.placeHolder.nextSibling;
      for (const node of route.childNodeArray) {
        if (nextSibling) {
          parentNode?.insertBefore(node, nextSibling);
        } else {
          parentNode?.appendChild(node);
        }
      }
    }
    this._lastRoutes = [ ...routes ];
  }
}

// Register custom element
if (!customElements.get(config.tagNames.outlet)) {
  customElements.define(config.tagNames.outlet, WcOutlet);
}