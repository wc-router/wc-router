interface ITagNames {
    route: string;
    routes: string;
    outlet: string;
    layout: string;
    layoutOutlet: string;
}
interface IConfig {
    tagNames: ITagNames;
    enableShadowRoot: boolean;
}

declare const config: IConfig;

export { config };
