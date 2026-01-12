import { getUUID } from "../getUUID.js";
import { config } from "../config.js";
import { raiseError } from "../raiseError.js";

const cache = new Map<string, string>();

export class WcLayout extends HTMLElement {
  private _template: HTMLTemplateElement;
  private _uuid: string = getUUID();
  private _placeHolder: Comment | null = null;
  constructor() {
    super();
    this._template = document.createElement('template');
  }

  loadTemplateFromCache(source: string): string | undefined {
    return cache.get(source);
  }

  async loadTemplateFromSource(source: string): Promise<string | null> {
    try {
      const response = await fetch(source);
      if (!response.ok) {
        raiseError(`Failed to fetch layout from source: ${source}, status: ${response.status}`);
      }
      const templateContent = await response.text();
      cache.set(source, templateContent);
      return templateContent;
    } catch (error) {
      raiseError(`Failed to load layout from source: ${source}, error: ${error}`);
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

  async loadTemplate(): Promise<HTMLTemplateElement> {
    const source = this.getAttribute('src');
    const layoutId = this.getAttribute('layout');
    if (source && layoutId) {
      console.warn('WcLayout have both "src" and "layout" attributes.');
    }
    const template = document.createElement('template');
    if (source) {
      if (cache.has(source)) {
        template.innerHTML = cache.get(source) || '';
      } else {
        template.innerHTML = await this.loadTemplateFromSource(source) || '';
        cache.set(source, template.innerHTML);
      }
    } else if (layoutId) {
      const templateContent = this.loadTemplateFromDocument(layoutId);
      if (templateContent) {
        template.innerHTML = templateContent;
      } else {
        console.warn(`WcLayout could not find template with id "${layoutId}".`);
      }
    }
    return template;
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

  get enableShadowRoot(): boolean {
    if (this.hasAttribute('enable-shadow-root')) {
      return true;
    } else if (this.hasAttribute('disable-shadow-root')) {
      return false;
    }
    return config.enableShadowRoot;
  }
}

// Register custom element
if (!customElements.get(config.tagNames.layout)) {
  customElements.define(config.tagNames.layout, WcLayout);
}