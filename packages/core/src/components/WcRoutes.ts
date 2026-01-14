import { matchRoutes } from "../matchRoutes.js";
import { parse } from "../parse.js";
import { WcOutlet } from "./WcOutlet.js";
import { WcRoute } from "./WcRoute.js";
import { config } from "../config.js";
import { raiseError } from "../raiseError.js";

/**
 * AppRoutes - Root component for wc-router
 * 
 * Container element that manages route definitions and navigation.
 */
export class WcRoutes extends HTMLElement {
  private static _instance: WcRoutes | null = null;
  private _outlet: WcOutlet | null = null;
  private _template: HTMLTemplateElement | null = null;
  private _routeChildNodes: WcRoute[] = [];
  constructor() {
    super();
    if (WcRoutes._instance) {
      raiseError(`${config.tagNames.routes} can only be instantiated once.`);
    }
    WcRoutes._instance = this;
    console.log(this.rootElement.querySelectorAll("*"));
  }

  static get instance(): WcRoutes {
    if (!WcRoutes._instance) {
      raiseError(`${config.tagNames.routes} has not been instantiated.`);
    }
    return WcRoutes._instance;
  }

  static navigate(path: string): void {
    WcRoutes.instance.navigate(path);
  }

  private _getOutlet(): WcOutlet {
    let outlet = document.querySelector(config.tagNames.outlet) as WcOutlet;
    if (!outlet) {
      outlet = document.createElement(config.tagNames.outlet) as WcOutlet;
      document.body.appendChild(outlet);
    }
    return outlet;
  }

  private _getTemplate() {
    const template = this.querySelector("template");
    return template;
  }
  
  get outlet(): WcOutlet {
    if (!this._outlet) {
      raiseError(`${config.tagNames.routes} has no outlet.`);
    }
    return this._outlet;
  }

  get template(): HTMLTemplateElement {
    if (!this._template) {
      raiseError(`${config.tagNames.routes} has no template.`);
    }
    return this._template;
  }

  get routeChildNodes(): WcRoute[] {
    return this._routeChildNodes;
  }

  navigate(path: string): void {
    if ((window as any).navigation) {
      (window as any).navigation.navigate(path);
    } else {
      history.pushState(null, '', path);
      this._applyRoute(path);
    }
  }

  private _applyRoute(path: string): void {
    const matchResult = matchRoutes(this, path);
    if (!matchResult) {
      raiseError(`${config.tagNames.routes} No route matched for path: ${path}`);
    }
    this.outlet.showRouteContent(matchResult.routes, matchResult.params);
  }

  private _onNavigateFunc(navEvent: any) {
    if (
      !navEvent.canIntercept ||
      navEvent.hashChange ||
      navEvent.downloadRequest !== null
    ) {
      return;
    }
    const routesNode = this;
    navEvent.intercept({
      async handler() {
        const url = new URL(navEvent.destination.url);
        routesNode._applyRoute(url.pathname);
      }
    });
  }

  private _onNavigate = this._onNavigateFunc.bind(this);

  async connectedCallback() {
    this._outlet = this._getOutlet();
    this._outlet.routesNode = this;
    this._template = this._getTemplate();
    if (!this._template) {
      raiseError(`${config.tagNames.routes} should have a <template> child element.`);
    }
    const fragment = await parse(this);
    this._outlet.rootNode.appendChild(fragment);
    this._applyRoute(window.location.pathname);
    ((window as any).navigation as any)?.addEventListener("navigate", this._onNavigate);
  }

  disconnectedCallback() {
    ((window as any).navigation as any)?.removeEventListener("navigate", this._onNavigate);
  }

  get rootElement(): ShadowRoot | HTMLElement {
    return this.shadowRoot ?? this;
  }  
}
