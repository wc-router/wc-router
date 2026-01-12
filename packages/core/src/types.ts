
export interface ITagNames {
  route: string;
  routes: string;
  outlet: string;
  layout: string;
  layoutOutlet: string;
}

export interface IConfig {
  tagNames: ITagNames;
  enableShadowRoot: boolean;
}