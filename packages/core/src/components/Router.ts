import { matchRoutes } from "../matchRoutes.js";
import { parse } from "../parse.js";
import { createOutlet, Outlet } from "./Outlet.js";
import { config } from "../config.js";
import { raiseError } from "../raiseError.js";
import { IOutlet, IRoute, IRouter } from "./types.js";

/**
 * AppRoutes - Root component for wc-router
 * 
 * Container element that manages route definitions and navigation.
 */
export class Router extends HTMLElement implements IRouter {
  private static _instance: IRouter | null = null;
  private _outlet: IOutlet | null = null;
  private _template: HTMLTemplateElement | null = null;
  private _routeChildNodes: IRoute[] = [];
  constructor() {
    super();
    if (Router._instance) {
      raiseError(`${config.tagNames.router} can only be instantiated once.`);
    }
    Router._instance = this;
  }

  static get instance(): IRouter {
    if (!Router._instance) {
      raiseError(`${config.tagNames.router} has not been instantiated.`);
    }
    return Router._instance;
  }

  static navigate(path: string): void {
    Router.instance.navigate(path);
  }

  private _getOutlet(): IOutlet {
    let outlet = document.querySelector<Outlet>(config.tagNames.outlet);
    if (!outlet) {
      outlet = createOutlet();
      document.body.appendChild(outlet);
    }
    return outlet;
  }

  private _getTemplate() {
    const template = this.querySelector("template");
    return template;
  }
  
  get outlet(): IOutlet {
    if (!this._outlet) {
      raiseError(`${config.tagNames.router} has no outlet.`);
    }
    return this._outlet;
  }

  get template(): HTMLTemplateElement {
    if (!this._template) {
      raiseError(`${config.tagNames.router} has no template.`);
    }
    return this._template;
  }

  get routeChildNodes(): IRoute[] {
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
      raiseError(`${config.tagNames.router} No route matched for path: ${path}`);
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
      raiseError(`${config.tagNames.router} should have a <template> child element.`);
    }
    const fragment = await parse(this);
    this._outlet.rootNode.appendChild(fragment);
    this._applyRoute(window.location.pathname);
    ((window as any).navigation as any)?.addEventListener("navigate", this._onNavigate);
  }

  disconnectedCallback() {
    ((window as any).navigation as any)?.removeEventListener("navigate", this._onNavigate);
  }
}
