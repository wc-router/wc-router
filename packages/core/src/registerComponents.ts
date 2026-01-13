import { WcRoute } from './components/WcRoute';
import { WcLayout } from './components/WcLayout';
import { WcOutlet } from './components/WcOutlet';
import { WcRoutes } from './components/WcRoutes';
import { WcLayoutOutlet } from './components/WcLayoutOutlet';
import { config } from './config';

export function registerComponents() {
  // Register custom element
  if (!customElements.get(config.tagNames.layout)) {
    customElements.define(config.tagNames.layout, WcLayout);
  }
  if (!customElements.get(config.tagNames.layoutOutlet)) {
    customElements.define(config.tagNames.layoutOutlet, WcLayoutOutlet);
  }
  if (!customElements.get(config.tagNames.outlet)) {
    customElements.define(config.tagNames.outlet, WcOutlet);
  }
  if (!customElements.get(config.tagNames.route)) {
    customElements.define(config.tagNames.route, WcRoute);
  }
  if (!customElements.get(config.tagNames.routes)) {
    customElements.define(config.tagNames.routes, WcRoutes);
  }
}