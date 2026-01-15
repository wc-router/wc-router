import { getUUID } from "../getUUID";
import { Router } from "./Router";

export class Link extends HTMLElement {
  _childNodeArray: Node[];
  _uuid: string = getUUID();
  _commentNode: Comment;
  constructor() {
    super();
    this._childNodeArray = Array.from(this.childNodes);
    this._commentNode = document.createComment(`@@link:${this._uuid}`);
    this.replaceWith(this._commentNode);

    this.addEventListener('click', (event) => {
      event.preventDefault();
      event.stopPropagation();
      const href = this.getAttribute('to') || '';
      if (href) {
        Router.navigate(href);
      }
    });
  }

  get uuid(): string {
    return this._uuid;
  }
  get commentNode(): Comment {
    return this._commentNode;
  }

  connectedCallback() {

  }
}