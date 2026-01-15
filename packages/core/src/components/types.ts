
export interface IRouteMatchResult {
  routes: IRoute[];
  params: Record<string, string>;
}

export type GuardHandler = (toPath: string, fromPath: string) => boolean | Promise<boolean>;

export interface _ILayout {
  readonly uuid: string;
  readonly enableShadowRoot: boolean;
  readonly name: string;
  loadTemplate(): Promise<HTMLTemplateElement>;
}
export type ILayout = _ILayout & Pick<Element,'childNodes'>;

export interface IRoute {
  routeParentNode: IRoute | null;
  readonly routeChildNodes: IRoute[];
  routesNode: IRouter;
  readonly path: string;
  readonly isRelative: boolean;
  readonly absolutePath: string;
  readonly uuid: string;
  placeHolder: Comment;
  readonly rootElement: ShadowRoot | HTMLElement;
  readonly childNodeArray: Node[];
  testPath(path: string): IRouteMatchResult | null;
  readonly routes: IRoute[];
  readonly patternText: string;
  readonly absolutePatternText: string;
  readonly params: Record<string, string>;
  readonly absoluteParamNames: string[];
  readonly weight: number;
  readonly absoluteWeight: number;
  readonly childIndex: number;
  guardHandler: GuardHandler;
  show(params: Record<string, string>): Promise<boolean>;
  hide(): void;
  shouldChange(newParams: Record<string, string>): boolean;
}

export interface IRouter {
  readonly basename: string;
  readonly outlet: IOutlet;
  readonly template: HTMLTemplateElement;
  readonly routeChildNodes: IRoute[];
  navigate(path: string): Promise<void>;
}

export interface IOutlet {
  routesNode: IRouter;
  readonly rootNode: HTMLElement | ShadowRoot;
  lastRoutes: IRoute[];
}

export interface ILayoutOutlet {
  layout: ILayout;
  readonly name: string;
  assignParams(params: Record<string, string>): void;
}

export interface ILink {
  readonly uuid: string;
  readonly commentNode: Comment;
  readonly router: IRouter;
}

export type BindType = "props" | "states" | "attr" | "";