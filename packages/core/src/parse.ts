import { WcLayout } from "./components/WcLayout";
import { WcRoute } from "./components/WcRoute";

function _parseNode(node: Node, routes: WcRoute[], map: Map<string, WcRoute | WcLayout>): DocumentFragment {
  const parentRoute: WcRoute | null = routes.length > 0 ? routes[routes.length - 1] : null;
  const fragment = document.createDocumentFragment();
  const childNodes = Array.from(node.childNodes);
  for(const childNode of childNodes) {
    if (childNode.nodeType === Node.ELEMENT_NODE) {
      let appendNode = childNode
      let element = childNode as HTMLElement;
      const tagName = element.tagName.toLowerCase();
      if (tagName === 'wc-route') {
        const cloneElement = document.importNode(element, true);
        customElements.upgrade(cloneElement);
        const route = cloneElement as WcRoute;
        route.parentRoute = parentRoute;
        route.placeHolder = document.createComment(`@@route:${route.uuid}`);
        routes.push(route);
        map.set(route.uuid, route);
        appendNode = route.placeHolder;
        element = route;
      } else if (tagName === 'wc-layout') {
        const cloneElement = document.importNode(element, true);
        customElements.upgrade(cloneElement);
        const layout = cloneElement as WcLayout;
        layout.placeHolder = document.createComment(`@@layout:${layout.uuid}`);
        map.set(layout.uuid, layout);
        appendNode = layout.placeHolder;
        element = layout;
      }
      const children = _parseNode(element, routes, map);
      element.innerHTML = "";
      element.appendChild(children);
      fragment.appendChild(appendNode);
    } else {
      fragment.appendChild(childNode);
    }
  }
  return fragment;
}

export function parse(fragment: DocumentFragment): void {
  const map: Map<string, WcRoute | WcLayout> = new Map();
  const fr = _parseNode(fragment, [], map);
  console.log(fr);
}
