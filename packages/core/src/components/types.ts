import { WcRoute } from "./WcRoute";

export interface IRouteMatchResult {
  routes: WcRoute[];
  params: Record<string, string>;
}