import { getUUID } from "../getUUID.js";

export class WcRoute extends HTMLElement {
  private _path: string = '';
  private _parentRoute: WcRoute | null = null;
  private _uuid: string = getUUID();
  private _placeHolder: Comment | null = null;
  constructor() {
    super();
    if (this.hasAttribute('path')) {
      this._path = this.getAttribute('path') || '';
    } else {
      console.warn('WcRoute should have a "path" attribute.');
    }
  }

  get parentRoute(): WcRoute | null {
    return this._parentRoute;
  }
  set parentRoute(value: WcRoute | null) {
    this._parentRoute = value;
  }

  get path(): string {
    return this._path;
  }

  get isRelative(): boolean {
    return !this._path.startsWith('/');
  }

  get absolutePath(): string {
    if (this.isRelative && !this._parentRoute) {
      console.warn('WcRoute is relative but has no parent route.');
      return this._path;
    }
    if (this.isRelative && this._parentRoute) {
      const parentPath = this._parentRoute.absolutePath;
      return parentPath.endsWith('/')
        ? parentPath + this._path
        : parentPath + '/' + this._path;
    }
    return this._path;
  }

  get uuid(): string {
    return this._uuid;
  }

  get placeHolder(): Comment | null {
    return this._placeHolder;
  }

  set placeHolder(value: Comment | null) {
    this._placeHolder = value;
  }

  get rootElement(): ShadowRoot | HTMLElement {
    return this.shadowRoot ?? this;
  }  
}

// Register custom element
if (!customElements.get('wc-route')) {
  customElements.define('wc-route', WcRoute);
}
