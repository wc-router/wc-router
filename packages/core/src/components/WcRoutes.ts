import { parse } from "../parse";
import { WcOutlet } from "./WcOutlet";

/**
 * AppRoutes - Root component for wc-router
 * 
 * Container element that manages route definitions and navigation.
 */
export class WcRoutes extends HTMLElement {
  private _outlet: WcOutlet | null = null;
  private _template: HTMLTemplateElement | null = null;
  constructor() {
    super();
    console.log(this.rootElement.querySelectorAll("*"));
  }

  private _getOutlet(): WcOutlet {
    let outlet = document.querySelector("wc-outlet") as WcOutlet;
    if (!outlet) {
      outlet = document.createElement("wc-outlet") as WcOutlet;
      document.body.appendChild(outlet);
    }
    return outlet;
  }

  private _getTemplate() {
    const template = this.querySelector("template");
    return template;
  }
  
  connectedCallback() {
    // TODO: Initialize router
    this._outlet = this._getOutlet();
    this._outlet.routes = this;
    this._template = this._getTemplate();
    if (!this._template) {
      console.warn('WcRoutes should have a <template> child element.');
      return;
    }
    parse(this._template.content);
  }

  disconnectedCallback() {
    // TODO: Cleanup
  }

  get rootElement(): ShadowRoot | HTMLElement {
    return this.shadowRoot ?? this;
  }  
}

// Register custom element
if (!customElements.get('wc-routes')) {
  customElements.define('wc-routes', WcRoutes);
}
