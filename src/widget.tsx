import { render } from 'preact';
import { App } from './App';
import styles from './styles/status.css?inline';

class CenatasureStatus extends HTMLElement {
  private root: ShadowRoot;

  constructor() {
    super();
    this.root = this.attachShadow({ mode: 'open' });
  }

  connectedCallback() {
    this.render();
  }

  private render() {
    // Clear existing content
    this.root.innerHTML = '';

    // Inject styles
    const styleEl = document.createElement('style');
    styleEl.textContent = styles;
    this.root.appendChild(styleEl);

    // Create container and render Preact app
    const container = document.createElement('div');
    this.root.appendChild(container);
    render(<App />, container);
  }
}

// Register the custom element
if (!customElements.get('status-widget')) {
  customElements.define('status-widget', CenatasureStatus);
}

// Also export for direct usage
export { App, CenatasureStatus };
