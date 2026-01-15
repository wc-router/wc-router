const config = {
    tagNames: {
        route: "wc-route",
        router: "wc-router",
        outlet: "wc-outlet",
        layout: "wc-layout",
        layoutOutlet: "wc-layout-outlet"
    },
    enableShadowRoot: false
};

function getUUID() {
    if (typeof crypto !== 'undefined' && crypto.randomUUID) {
        return crypto.randomUUID();
    }
    // Simple UUID generator
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
        const r = (Math.random() * 16) | 0, v = c === 'x' ? r : (r & 0x3) | 0x8;
        return v.toString(16);
    });
}

function raiseError(message) {
    throw new Error(`[wc-router] ${message}`);
}

class Route extends HTMLElement {
    _path = '';
    _routeParentNode = null;
    _routeChildNodes = [];
    _routesNode = null;
    _uuid = getUUID();
    _placeHolder = null;
    _childNodeArray = [];
    _isMadeArray = false;
    _paramNames = [];
    _patternText = '';
    _params = {};
    _absolutePattern = null;
    _weight = -1;
    _absoluteWeight = 0;
    _childIndex = 0;
    constructor() {
        super();
        if (this.hasAttribute('path')) {
            this._path = this.getAttribute('path') || '';
        }
        else {
            if (this.hasAttribute('index')) {
                this._path = '';
            }
            else {
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
            }
            else {
                patternSegments.push(segment);
                this._weight += 2;
            }
        }
        this._patternText = patternSegments.join('\\/');
    }
    get routeParentNode() {
        return this._routeParentNode;
    }
    set routeParentNode(value) {
        this._routeParentNode = value;
        if (value) {
            value.routeChildNodes.push(this);
            this._childIndex = value.routeChildNodes.length - 1;
        }
        else {
            // Top-level route
            this.routesNode.routeChildNodes.push(this);
            this._childIndex = this.routesNode.routeChildNodes.length - 1;
        }
    }
    get routeChildNodes() {
        return this._routeChildNodes;
    }
    get routesNode() {
        if (!this._routesNode) {
            raiseError(`${config.tagNames.route} has no routesNode.`);
        }
        return this._routesNode;
    }
    set routesNode(value) {
        this._routesNode = value;
    }
    get path() {
        return this._path;
    }
    get isRelative() {
        return !this._path.startsWith('/');
    }
    _checkParentNode(hasParentCallback, noParentCallback) {
        if (this.isRelative && !this._routeParentNode) {
            raiseError(`${config.tagNames.route} is relative but has no parent route.`);
        }
        if (!this.isRelative && this._routeParentNode) {
            raiseError(`${config.tagNames.route} is absolute but has a parent route.`);
        }
        if (this.isRelative && this._routeParentNode) {
            return hasParentCallback(this._routeParentNode);
        }
        else {
            return noParentCallback();
        }
    }
    get absolutePath() {
        return this._checkParentNode((routeParentNode) => {
            const parentPath = routeParentNode.absolutePath;
            return parentPath.endsWith('/')
                ? parentPath + this._path
                : parentPath + '/' + this._path;
        }, () => {
            return this._path;
        });
    }
    get uuid() {
        return this._uuid;
    }
    get placeHolder() {
        if (!this._placeHolder) {
            raiseError(`${config.tagNames.route} placeHolder is not set.`);
        }
        return this._placeHolder;
    }
    set placeHolder(value) {
        this._placeHolder = value;
    }
    get rootElement() {
        return this.shadowRoot ?? this;
    }
    get childNodeArray() {
        if (!this._isMadeArray) {
            this._childNodeArray = Array.from(this.rootElement.childNodes);
            this._isMadeArray = true;
        }
        return this._childNodeArray;
    }
    testPath(path) {
        const params = {};
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
    get routes() {
        if (this.routeParentNode) {
            return this.routeParentNode.routes.concat(this);
        }
        else {
            return [this];
        }
    }
    get patternText() {
        return this._patternText;
    }
    get absolutePatternText() {
        return this._checkParentNode((routeParentNode) => {
            const parentPattern = routeParentNode.absolutePatternText;
            return parentPattern.endsWith('\\/')
                ? parentPattern + this._patternText
                : parentPattern + '\\/' + this._patternText;
        }, () => {
            return this._patternText;
        });
    }
    get params() {
        return this._params;
    }
    get absoluteParamNames() {
        return this._checkParentNode((routeParentNode) => {
            return [
                ...routeParentNode.absoluteParamNames,
                ...this._paramNames
            ];
        }, () => {
            return [...this._paramNames];
        });
    }
    get weight() {
        return this._weight;
    }
    get absoluteWeight() {
        if (this._absoluteWeight >= 0) {
            return this._absoluteWeight;
        }
        return (this._absoluteWeight = this._checkParentNode((routeParentNode) => {
            return routeParentNode.absoluteWeight + this._weight;
        }, () => {
            return this._weight;
        }));
    }
    get childIndex() {
        return this._childIndex;
    }
    show(params) {
        this._params = {};
        for (const key of this._paramNames) {
            this._params[key] = params[key];
        }
        const parentNode = this.placeHolder.parentNode;
        const nextSibling = this.placeHolder.nextSibling;
        for (const node of this.childNodeArray) {
            if (nextSibling) {
                parentNode?.insertBefore(node, nextSibling);
            }
            else {
                parentNode?.appendChild(node);
            }
        }
    }
    hide() {
        this._params = {};
        for (const node of this.childNodeArray) {
            node.parentNode?.removeChild(node);
        }
    }
}

const cache = new Map();
class Layout extends HTMLElement {
    _uuid = getUUID();
    _name = '';
    constructor() {
        super();
        this._name = this.getAttribute('name') || '';
    }
    async _loadTemplateFromSource(source) {
        try {
            const response = await fetch(source);
            if (!response.ok) {
                raiseError(`${config.tagNames.layout} failed to fetch layout from source: ${source}, status: ${response.status}`);
            }
            const templateContent = await response.text();
            cache.set(source, templateContent);
            return templateContent;
        }
        catch (error) {
            raiseError(`${config.tagNames.layout} failed to load layout from source: ${source}, error: ${error}`);
        }
    }
    _loadTemplateFromDocument(id) {
        const element = document.getElementById(`${id}`);
        if (element) {
            if (element instanceof HTMLTemplateElement) {
                return element.innerHTML;
            }
        }
        return null;
    }
    async loadTemplate() {
        const source = this.getAttribute('src');
        const layoutId = this.getAttribute('layout');
        if (source && layoutId) {
            console.warn(`${config.tagNames.layout} have both "src" and "layout" attributes.`);
        }
        const template = document.createElement('template');
        if (source) {
            if (cache.has(source)) {
                template.innerHTML = cache.get(source) || '';
            }
            else {
                template.innerHTML = await this._loadTemplateFromSource(source) || '';
                cache.set(source, template.innerHTML);
            }
        }
        else if (layoutId) {
            const templateContent = this._loadTemplateFromDocument(layoutId);
            if (templateContent) {
                template.innerHTML = templateContent;
            }
            else {
                console.warn(`${config.tagNames.layout} could not find template with id "${layoutId}".`);
            }
        }
        return template;
    }
    get uuid() {
        return this._uuid;
    }
    get enableShadowRoot() {
        if (this.hasAttribute('enable-shadow-root')) {
            return true;
        }
        else if (this.hasAttribute('disable-shadow-root')) {
            return false;
        }
        return config.enableShadowRoot;
    }
    get name() {
        return this._name;
    }
}

class Outlet extends HTMLElement {
    _routesNode = null;
    _lastRoutes = [];
    constructor() {
        super();
        if (config.enableShadowRoot) {
            this.attachShadow({ mode: 'open' });
        }
    }
    get routesNode() {
        if (!this._routesNode) {
            raiseError(`${config.tagNames.outlet} has no routesNode.`);
        }
        return this._routesNode;
    }
    set routesNode(value) {
        this._routesNode = value;
    }
    get rootNode() {
        if (this.shadowRoot) {
            return this.shadowRoot;
        }
        return this;
    }
    showRouteContent(routes, params) {
        // Hide previous routes
        const routesSet = new Set(routes);
        for (const route of this._lastRoutes) {
            if (!routesSet.has(route)) {
                route.hide();
            }
        }
        const lastRouteSet = new Set(this._lastRoutes);
        for (const route of routes) {
            if (!lastRouteSet.has(route)) {
                route.show(params);
            }
        }
        this._lastRoutes = [...routes];
    }
    connectedCallback() {
        //    console.log('WcOutlet connectedCallback');
    }
}
function createOutlet() {
    return document.createElement(config.tagNames.outlet);
}

function _matchRoutes(routesNode, routeNode, routes, path, results) {
    const nextRoutes = routes.concat(routeNode);
    const matchResult = routeNode.testPath(path);
    if (matchResult) {
        results.push(matchResult);
        return; // Stop searching deeper routes once a match is found
    }
    for (const childRoute of routeNode.routeChildNodes) {
        _matchRoutes(routesNode, childRoute, nextRoutes, path, results);
    }
}
function matchRoutes(routesNode, path) {
    const routes = [];
    const topLevelRoutes = routesNode.routeChildNodes;
    const results = [];
    for (const route of topLevelRoutes) {
        _matchRoutes(routesNode, route, routes, path, results);
    }
    results.sort((a, b) => {
        const lastRouteA = a.routes.at(-1);
        const lastRouteB = b.routes.at(-1);
        const diffWeight = lastRouteA.absoluteWeight - lastRouteB.absoluteWeight;
        if (diffWeight !== 0) {
            return -diffWeight;
        }
        const diffIndex = lastRouteA.childIndex - lastRouteB.childIndex;
        return diffIndex;
    });
    if (results.length > 0) {
        return results[0];
    }
    return null;
}

class LayoutOutlet extends HTMLElement {
    _layout = null;
    _isInitialized = false;
    _layoutChildNodes = [];
    constructor() {
        super();
    }
    get layout() {
        if (!this._layout) {
            raiseError(`${config.tagNames.layoutOutlet} has no layout.`);
        }
        return this._layout;
    }
    set layout(value) {
        this._layout = value;
        this.setAttribute('name', value.name);
    }
    get name() {
        return this.layout.name;
    }
    async _initialize() {
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
            for (const childNode of Array.from(this.layout.childNodes)) {
                this._layoutChildNodes.push(childNode);
                this.appendChild(childNode);
            }
        }
        else {
            const fragmentForTemplate = template.content.cloneNode(true);
            const slotElementBySlotName = new Map();
            fragmentForTemplate.querySelectorAll('slot').forEach((slotElement) => {
                const slotName = slotElement.getAttribute('name') || '';
                if (!slotElementBySlotName.has(slotName)) {
                    slotElementBySlotName.set(slotName, slotElement);
                }
                else {
                    console.warn(`${config.tagNames.layoutOutlet} duplicate slot name "${slotName}" in layout template.`);
                }
            });
            const fragmentBySlotName = new Map();
            const fragmentForChildNodes = document.createDocumentFragment();
            for (const childNode of Array.from(this.layout.childNodes)) {
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
            for (const [slotName, slotElement] of slotElementBySlotName) {
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
        await this._initialize();
        //    console.log(`${config.tagNames.layoutOutlet} connectedCallback`);
    }
}
function createLayoutOutlet() {
    return document.createElement(config.tagNames.layoutOutlet);
}

async function _parseNode(routesNode, node, routes, map) {
    const routeParentNode = routes.length > 0 ? routes[routes.length - 1] : null;
    const fragment = document.createDocumentFragment();
    const childNodes = Array.from(node.childNodes);
    for (const childNode of childNodes) {
        if (childNode.nodeType === Node.ELEMENT_NODE) {
            let appendNode = childNode;
            let element = childNode;
            const tagName = element.tagName.toLowerCase();
            if (tagName === config.tagNames.route) {
                const childFragment = document.createDocumentFragment();
                // Move child nodes to fragment to avoid duplication of
                for (const childNode of Array.from(element.childNodes)) {
                    childFragment.appendChild(childNode);
                }
                const cloneElement = document.importNode(element, true);
                customElements.upgrade(cloneElement);
                cloneElement.appendChild(childFragment);
                const route = cloneElement;
                route.routesNode = routesNode;
                route.routeParentNode = routeParentNode;
                route.placeHolder = document.createComment(`@@route:${route.uuid}`);
                routes.push(route);
                map.set(route.uuid, route);
                appendNode = route.placeHolder;
                element = route;
            }
            else if (tagName === config.tagNames.layout) {
                const childFragment = document.createDocumentFragment();
                // Move child nodes to fragment to avoid duplication of
                for (const childNode of Array.from(element.childNodes)) {
                    childFragment.appendChild(childNode);
                }
                const cloneElement = document.importNode(element, true);
                customElements.upgrade(cloneElement);
                cloneElement.appendChild(childFragment);
                const layout = cloneElement;
                const layoutOutlet = createLayoutOutlet();
                layoutOutlet.layout = layout;
                appendNode = layoutOutlet;
                element = cloneElement;
            }
            const children = await _parseNode(routesNode, element, routes, map);
            element.innerHTML = "";
            element.appendChild(children);
            fragment.appendChild(appendNode);
        }
        else {
            fragment.appendChild(childNode);
        }
    }
    return fragment;
}
async function parse(routesNode) {
    const map = new Map();
    const fr = await _parseNode(routesNode, routesNode.template.content, [], map);
    console.log(fr);
    return fr;
}

/**
 * AppRoutes - Root component for wc-router
 *
 * Container element that manages route definitions and navigation.
 */
class Router extends HTMLElement {
    static _instance = null;
    _outlet = null;
    _template = null;
    _routeChildNodes = [];
    constructor() {
        super();
        if (Router._instance) {
            raiseError(`${config.tagNames.router} can only be instantiated once.`);
        }
        Router._instance = this;
    }
    static get instance() {
        if (!Router._instance) {
            raiseError(`${config.tagNames.router} has not been instantiated.`);
        }
        return Router._instance;
    }
    static navigate(path) {
        Router.instance.navigate(path);
    }
    _getOutlet() {
        let outlet = document.querySelector(config.tagNames.outlet);
        if (!outlet) {
            outlet = createOutlet();
            document.body.appendChild(outlet);
        }
        return outlet;
    }
    _getTemplate() {
        const template = this.querySelector("template");
        return template;
    }
    get outlet() {
        if (!this._outlet) {
            raiseError(`${config.tagNames.router} has no outlet.`);
        }
        return this._outlet;
    }
    get template() {
        if (!this._template) {
            raiseError(`${config.tagNames.router} has no template.`);
        }
        return this._template;
    }
    get routeChildNodes() {
        return this._routeChildNodes;
    }
    navigate(path) {
        if (window.navigation) {
            window.navigation.navigate(path);
        }
        else {
            history.pushState(null, '', path);
            this._applyRoute(path);
        }
    }
    _applyRoute(path) {
        const matchResult = matchRoutes(this, path);
        if (!matchResult) {
            raiseError(`${config.tagNames.router} No route matched for path: ${path}`);
        }
        this.outlet.showRouteContent(matchResult.routes, matchResult.params);
    }
    _onNavigateFunc(navEvent) {
        if (!navEvent.canIntercept ||
            navEvent.hashChange ||
            navEvent.downloadRequest !== null) {
            return;
        }
        const routesNode = this;
        navEvent.intercept({
            async handler() {
                const url = new URL(navEvent.destination.url);
                routesNode._applyRoute(url.pathname);
            }
        });
    }
    _onNavigate = this._onNavigateFunc.bind(this);
    async connectedCallback() {
        this._outlet = this._getOutlet();
        this._outlet.routesNode = this;
        this._template = this._getTemplate();
        if (!this._template) {
            raiseError(`${config.tagNames.router} should have a <template> child element.`);
        }
        const fragment = await parse(this);
        this._outlet.rootNode.appendChild(fragment);
        this._applyRoute(window.location.pathname);
        window.navigation?.addEventListener("navigate", this._onNavigate);
    }
    disconnectedCallback() {
        window.navigation?.removeEventListener("navigate", this._onNavigate);
    }
}

function registerComponents() {
    // Register custom element
    if (!customElements.get(config.tagNames.layout)) {
        customElements.define(config.tagNames.layout, Layout);
    }
    if (!customElements.get(config.tagNames.layoutOutlet)) {
        customElements.define(config.tagNames.layoutOutlet, LayoutOutlet);
    }
    if (!customElements.get(config.tagNames.outlet)) {
        customElements.define(config.tagNames.outlet, Outlet);
    }
    if (!customElements.get(config.tagNames.route)) {
        customElements.define(config.tagNames.route, Route);
    }
    if (!customElements.get(config.tagNames.router)) {
        customElements.define(config.tagNames.router, Router);
    }
}

registerComponents();

export { config };
//# sourceMappingURL=index.esm.js.map
