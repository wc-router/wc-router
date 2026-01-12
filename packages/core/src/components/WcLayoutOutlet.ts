import { WcLayout } from "./WcLayout.js";
import { config } from "../config.js";
import { raiseError } from "../raiseError.js";

export class WcLayoutOutlet extends HTMLElement {
  private _layout: WcLayout | null = null;
  private _isInitialized: boolean = false;
  private _layoutChildNodes: Node[] = [];
  constructor() {
    super();
  }

  get layout(): WcLayout {
    if (!this._layout) {
      raiseError('WcLayoutOutlet has no layout.');
    }
    return this._layout;
  }
  set layout(value: WcLayout) {
    this._layout = value;
  }
  
  async initialize(): Promise<void> {
    if (this._isInitialized) {
      return;
    }
    this._isInitialized = true;
    if (this.layout.enableShadowRoot) {
      this.attachShadow({ mode: 'open' });
    }
    const template = await this.layout.loadTemplate();
    if (this.shadowRoot) {
      this.shadowRoot.appendChild(template.content.cloneNode(true));
      for(const childNode of Array.from(this.layout.childNodes)) {
        this._layoutChildNodes.push(childNode);
        this.appendChild(childNode);
      }
    } else {
      const fragmentForTemplate = template.content.cloneNode(true) as DocumentFragment;
      const slotElementBySlotName: Map<string, Element> = new Map();
      fragmentForTemplate.querySelectorAll('slot').forEach((slotElement) => {
        const slotName = slotElement.getAttribute('name') || '';
        if (!slotElementBySlotName.has(slotName)) {
          slotElementBySlotName.set(slotName, slotElement);
        } else {
          console.warn(`Duplicate slot name "${slotName}" in layout template.`);
        }
      });

      const fragmentBySlotName: Map<string, DocumentFragment> = new Map();
      const fragmentForChildNodes = document.createDocumentFragment();
      for(const childNode of Array.from(this.layout.childNodes)) {
        this._layoutChildNodes.push(childNode);
        if (childNode instanceof Element) {
          const slotName = childNode.getAttribute('slot') || '';
          if (slotName.length > 0 && slotElementBySlotName.has(slotName)) {
            if (!fragmentBySlotName.has(slotName)) {
              fragmentBySlotName.set(slotName, document.createDocumentFragment());
            }
            fragmentBySlotName.get(slotName)?.appendChild(childNode);
            continue;
          }
        }
        fragmentForChildNodes.appendChild(childNode);
      }
      for(const [slotName, slotElement] of slotElementBySlotName) {
        const fragment = fragmentBySlotName.get(slotName);
        if (fragment) {
          slotElement.replaceWith(fragment);
        }
      }
      const defaultSlot = slotElementBySlotName.get('');
      if (defaultSlot) {
        defaultSlot.replaceWith(fragmentForChildNodes);
      }

      this.appendChild(fragmentForTemplate);
    }
  } 

  async connectedCallback() {
    await this.initialize();
  }

  get rootNode(): HTMLElement | ShadowRoot {
    if (this.shadowRoot) {
      return this.shadowRoot;
    }
    return this;
  }
}

// Register custom element
if (!customElements.get(config.tagNames.layoutOutlet)) {
  customElements.define(config.tagNames.layoutOutlet, WcLayoutOutlet);
}