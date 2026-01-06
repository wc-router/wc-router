import { getUUID } from "../getUUID.js";

const cache = new Map<string, string>();


export class WcLayout extends HTMLElement {
  private _template: HTMLTemplateElement;
  private _uuid: string = getUUID();
  private _placeHolder: Comment | null = null;
  constructor() {
    super();
    this.attachShadow({ mode: 'open' });
    this._template = document.createElement('template');
  }

  loadTemplateFromCache(source: string): string | undefined {
    return cache.get(source);
  }

  async loadTemplateFromSource(source: string): Promise<string | null> {
    try {
        const response = await fetch(source);
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        const templateContent = await response.text();
        cache.set(source, templateContent);
        return templateContent;
    } catch (error) {
        console.error('Failed to load layout from source:', error);
        return null;
    }
  }

  loadTemplateFromDocument(id: string): string | null {
    const element = document.getElementById(`${id}`) as HTMLElement | null;
    if (element) {
      if (element instanceof HTMLTemplateElement) {
        return element.innerHTML;
      }
    }
    return null;
  }

  async connectedCallback() {
    const source = this.getAttribute('src');
    const layoutId = this.getAttribute('layout');
    if (source && layoutId) {
      console.warn('WcLayout have both "src" and "layout" attributes.');
    }
    if (source) {
      if (cache.has(source)) {
        this._template.innerHTML = cache.get(source) || '';
      } else {
        this._template.innerHTML = await this.loadTemplateFromSource(source) || '';
        cache.set(source, this._template.innerHTML);
      }
    } else if (layoutId) {
      const templateContent = this.loadTemplateFromDocument(layoutId);
      if (templateContent) {
        this._template.innerHTML = templateContent;
      } else {
        console.warn(`WcLayout could not find template with id "${layoutId}".`);
      }
    }
    if (this._template.content.children.length === 0) {
      console.warn('WcLayout has no template content to render.');
      return;
    }
    if (this.shadowRoot) {
      this.shadowRoot.appendChild(this._template.content.cloneNode(true));
    }
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
}

// Register custom element
if (!customElements.get('wc-layout')) {
  customElements.define('wc-layout', WcLayout);
}