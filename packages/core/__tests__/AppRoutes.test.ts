import { describe, it, expect, beforeAll } from 'vitest';
import { AppRoutes } from '../src/components/WcRoutes';

describe('AppRoutes', () => {
  beforeAll(() => {
    // Register the custom element if not already registered
    if (!customElements.get('app-routes')) {
      customElements.define('app-routes', AppRoutes);
    }
  });

  it('should be defined as a custom element', () => {
    const element = document.createElement('app-routes');
    expect(element).toBeInstanceOf(AppRoutes);
  });

  it('should be an instance of HTMLElement', () => {
    const element = new AppRoutes();
    expect(element).toBeInstanceOf(HTMLElement);
  });
});
