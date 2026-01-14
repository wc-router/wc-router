import { getUUID } from "../getUUID.js";
import { WcRoutes } from "./WcRoutes.js";
import { config } from "../config.js";
import { raiseError } from "../raiseError.js";
import { IRouteMatchResult } from "./types.js";

export class WcRoute extends HTMLElement {
  private _path: string = '';
  private _routeParentNode: WcRoute | null = null;
  private _routeChildNodes: WcRoute[] = [];
  private _routesNode: WcRoutes | null = null;
  private _uuid: string = getUUID();
  private _placeHolder: Comment | null = null;
  private _childNodeArray: Node[] = [];
  private _isMadeArray: boolean = false;
  private _paramNames: string[] = [];
  private _patternText: string = '';
  private _params: Record<string, string> = {};
  private _absolutePattern: RegExp | null = null;
  private _weight: number = -1;
  private _absoluteWeight: number = 0;
  private _childIndex: number = 0;
  constructor() {
    super();
    if (this.hasAttribute('path')) {
      this._path = this.getAttribute('path') || '';
    } else {
      if (this.hasAttribute('index')) {
        this._path = '';
      } else {
        raiseError(`${config.tagNames.route} should have a "path" or "index" attribute.`);
      }
    }
    const segments = this._path.split('/');
    const patternSegments = [];
    for (const segment of segments) {
      if (segment.startsWith(':')) {
        this._paramNames.push(segment.substring(1));
        patternSegments.push('([^\\/]+)');
        this._weight += 1;
      } else {
        patternSegments.push(segment);
        this._weight += 2;
      }
    }
    this._patternText = patternSegments.join('\\/');
  }

  get routeParentNode(): WcRoute | null {
    return this._routeParentNode;
  }
  set routeParentNode(value: WcRoute | null) {
    this._routeParentNode = value;
    if (value) {
      value.routeChildNodes.push(this);
      this._childIndex = value.routeChildNodes.length - 1;
    } else {
      // Top-level route
      this.routesNode.routeChildNodes.push(this);
      this._childIndex = this.routesNode.routeChildNodes.length - 1;
    }
  }

  get routeChildNodes(): WcRoute[] {
    return this._routeChildNodes;
  }

  get routesNode(): WcRoutes {
    if (!this._routesNode) {
      raiseError(`${config.tagNames.route} has no routesNode.`);
    }
    return this._routesNode;
  }
  set routesNode(value: WcRoutes) {
    this._routesNode = value;
  }

  get path(): string {
    return this._path;
  }

  get isRelative(): boolean {
    return !this._path.startsWith('/');
  }

  private _checkParentNode<T>(
    hasParentCallback: (routeParentNode: WcRoute) => T, 
    noParentCallback: () => T
  ): T {
    if (this.isRelative && !this._routeParentNode) {
      raiseError(`${config.tagNames.route} is relative but has no parent route.`);
    }
    if (!this.isRelative && this._routeParentNode) {
      raiseError(`${config.tagNames.route} is absolute but has a parent route.`);
    }
    if (this.isRelative && this._routeParentNode) {
      return hasParentCallback(this._routeParentNode);
    } else {
      return noParentCallback();
    }
  }

  get absolutePath(): string {
    return this._checkParentNode<string>((routeParentNode) => {
        const parentPath = routeParentNode.absolutePath;
        return parentPath.endsWith('/')
          ? parentPath + this._path
          : parentPath + '/' + this._path;

      }, () => {
        return this._path;
      }
    );
  }

  get uuid(): string {
    return this._uuid;
  }

  get placeHolder(): Comment {
    if (!this._placeHolder) {
      raiseError(`${config.tagNames.route} placeHolder is not set.`);
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

  testPath(path: string): IRouteMatchResult | null {
    const params: Record<string, string> = {};
    const testResult = this._absolutePattern?.exec(path) ?? 
      (this._absolutePattern = new RegExp(`^${this.absolutePatternText}$`)).exec(path);
    if (testResult) {
      this.absoluteParamNames.forEach((paramName, index) => {
        params[paramName] = testResult[index + 1];
      });
      return {
        routes: this.routes,
        params: params
      };
    }
    return null;
  }

  get routes(): WcRoute[] {
    if (this.routeParentNode) {
      return this.routeParentNode.routes.concat(this);
    } else {
      return [ this ];
    }
  }

  get patternText(): string {
    return this._patternText;
  }

  get absolutePatternText(): string {
    return this._checkParentNode<string>((routeParentNode) => {
      const parentPattern = routeParentNode.absolutePatternText;
      return parentPattern.endsWith('\\/')
        ? parentPattern + this._patternText
        : parentPattern + '\\/' + this._patternText;
    }, () => {
      return this._patternText;
    });
  }

  get params(): Record<string, string> {
    return this._params;
  }

  get absoluteParamNames(): string[] {
    return this._checkParentNode<string[]>((routeParentNode) => {
      return [
        ...routeParentNode.absoluteParamNames,
        ...this._paramNames
      ];
    }, () => {
      return [ ...this._paramNames ];
    });
  }

  get weight(): number {
    return this._weight;
  }

  get absoluteWeight(): number {
    if (this._absoluteWeight >= 0) {
      return this._absoluteWeight
    }
    return (this._absoluteWeight = this._checkParentNode<number>((routeParentNode) => {
      return routeParentNode.absoluteWeight + this._weight;
    }, () => {
      return this._weight;
    }));
  }

  get childIndex(): number {
    return this._childIndex;
  }

  show(params: Record<string, string>) {
    this._params = {};
    for(const key of this._paramNames) {
      this._params[key] = params[key];
    }
    const parentNode = this.placeHolder.parentNode;
    const nextSibling = this.placeHolder.nextSibling;
    for (const node of this.childNodeArray) {
      if (nextSibling) {
        parentNode?.insertBefore(node, nextSibling);
      } else {
        parentNode?.appendChild(node);
      }
    }
  }

  hide() {
    this._params = {};
    for(const node of this.childNodeArray) {
      node.parentNode?.removeChild(node);
    }
  }
}
