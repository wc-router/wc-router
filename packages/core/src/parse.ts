import { WcLayout } from "./components/WcLayout.js";
import { WcLayoutOutlet } from "./components/WcLayoutOutlet.js";
import { WcRoute } from "./components/WcRoute.js";
import { WcRoutes } from "./components/WcRoutes.js";
import { config } from "./config.js";

async function _parseNode(
  routesNode: WcRoutes, 
  node: Node, 
  routes: WcRoute[], 
  map: Map<string, WcRoute | WcLayout>
): Promise<DocumentFragment> {
  const routeParentNode: WcRoute | null = routes.length > 0 ? routes[routes.length - 1] : null;
  const fragment = document.createDocumentFragment();
  const childNodes = Array.from(node.childNodes);
  for(const childNode of childNodes) {
    if (childNode.nodeType === Node.ELEMENT_NODE) {
      let appendNode = childNode
      let element = childNode as HTMLElement;
      const tagName = element.tagName.toLowerCase();
      if (tagName === config.tagNames.route) {
        const childFragment = document.createDocumentFragment();
        // Move child nodes to fragment to avoid duplication of
        for(const childNode of Array.from(element.childNodes)) {
          childFragment.appendChild(childNode);
        }
        const cloneElement = document.importNode(element, true);
        customElements.upgrade(cloneElement);
        cloneElement.appendChild(childFragment);
        const route = cloneElement as WcRoute;
        route.routesNode = routesNode;
        route.routeParentNode = routeParentNode;
        route.placeHolder = document.createComment(`@@route:${route.uuid}`);
        routes.push(route);
        map.set(route.uuid, route);
        appendNode = route.placeHolder;
        element = route;
      } else if (tagName === config.tagNames.layout) {
        const childFragment = document.createDocumentFragment();
        // Move child nodes to fragment to avoid duplication of
        for(const childNode of Array.from(element.childNodes)) {
          childFragment.appendChild(childNode);
        }
        const cloneElement = document.importNode(element, true);
        customElements.upgrade(cloneElement);
        cloneElement.appendChild(childFragment);
        const layout = cloneElement as WcLayout;
        const layoutOutlet = document.createElement(config.tagNames.layoutOutlet) as WcLayoutOutlet;
        layoutOutlet.layout = layout;
        appendNode = layoutOutlet;
        element = cloneElement;
      }
      const children = await _parseNode(routesNode, element, routes, map);
      element.innerHTML = "";
      element.appendChild(children);
      fragment.appendChild(appendNode);
    } else {
      fragment.appendChild(childNode);
    }
  }
  return fragment;
}

export async function parse(routesNode: WcRoutes): Promise<DocumentFragment> {
  const map: Map<string, WcRoute | WcLayout> = new Map();
  const fr = await _parseNode(routesNode, routesNode.template.content, [], map);
  console.log(fr);
  return fr;
}