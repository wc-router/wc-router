import { WcRoutes } from "./WcRoutes";

export class WcOutlet extends HTMLElement {
  private _routes: WcRoutes | null = null;
  constructor() {
    super();
  }

  get routes(): WcRoutes | null {
    return this._routes;
  }
  set routes(value: WcRoutes | null) {
    this._routes = value;
  }
}

// Register custom element
if (!customElements.get('wc-outlet')) {
  customElements.define('wc-outlet', WcOutlet);
}