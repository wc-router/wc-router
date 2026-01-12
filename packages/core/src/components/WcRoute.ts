import { getUUID } from "../getUUID.js";
import { WcRoutes } from "./WcRoutes.js";
import { config } from "../config.js";
import { raiseError } from "../raiseError.js";

export class WcRoute extends HTMLElement {
  private _path: string = '';
  private _routeParentNode: WcRoute | null = null;
  private _routeChildNodes: WcRoute[] = [];
  private _routesNode: WcRoutes | null = null;
  private _uuid: string = getUUID();
  private _placeHolder: Comment | null = null;
  private _childNodeArray: Node[] = [];
  private _isMadeArray: boolean = false;
  constructor() {
    super();
    if (this.hasAttribute('path')) {
      this._path = this.getAttribute('path') || '';
    } else {
      raiseError('WcRoute should have a "path" attribute.');
    }
  }

  get routeParentNode(): WcRoute | null {
    return this._routeParentNode;
  }
  set routeParentNode(value: WcRoute | null) {
    this._routeParentNode = value;
    if (value) {
      value.routeChildNodes.push(this);
    } else {
      // Top-level route
      this._routesNode?.routeChildNodes.push(this);
    }
  }

  get routeChildNodes(): WcRoute[] {
    return this._routeChildNodes;
  }

  get routesNode(): WcRoutes | null {
    return this._routesNode;
  }
  set routesNode(value: WcRoutes | null) {
    this._routesNode = value;
  }

  get path(): string {
    return this._path;
  }

  get isRelative(): boolean {
    return !this._path.startsWith('/');
  }

  get absolutePath(): string {
    if (this.isRelative && !this._routeParentNode) {
      raiseError('WcRoute is relative but has no parent route.');
    }
    if (!this.isRelative && this._routeParentNode) {
      raiseError('WcRoute is absolute but has a parent route.');
    }
    if (this.isRelative && this._routeParentNode) {
      const parentPath = this._routeParentNode.absolutePath;
      return parentPath.endsWith('/')
        ? parentPath + this._path
        : parentPath + '/' + this._path;
    }
    return this._path;
  }

  get uuid(): string {
    return this._uuid;
  }

  get placeHolder(): Comment {
    if (!this._placeHolder) {
      raiseError('WcRoute placeHolder is not set.');
    }
    return this._placeHolder;
  }

  set placeHolder(value: Comment) {
    this._placeHolder = value;
  }

  get rootElement(): ShadowRoot | HTMLElement {
    return this.shadowRoot ?? this;
  }

  get childNodeArray(): Node[] {
    if (!this._isMadeArray) {
      this._childNodeArray = Array.from(this.rootElement.childNodes);
      this._isMadeArray = true;
    }
    return this._childNodeArray;
  }

  testPath(path: string): boolean {
    return this.absolutePath === path;
  }

  hide() {
    for(const node of this.childNodeArray) {
      node.parentNode?.removeChild(node);
    }
  }
}

// Register custom element
if (!customElements.get(config.tagNames.route)) {
  customElements.define(config.tagNames.route, WcRoute);
}
