
export interface ITagNames {
  route: string;
  router: string;
  outlet: string;
  layout: string;
  layoutOutlet: string;
}

export interface IConfig {
  tagNames: ITagNames;
  enableShadowRoot: boolean;
}