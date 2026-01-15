interface ITagNames {
    route: string;
    router: string;
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
