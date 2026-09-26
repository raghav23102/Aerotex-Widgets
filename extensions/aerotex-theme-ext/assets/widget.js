console.log("Aerotex Widgets Theme Extension Loaded.");

(function() {
  const AppDomain = "https://aerotex-widgets.example.com";

  function initWidgets() {
    // 1. Initialize App Embeds
    const container = document.getElementById('aerotex-widgets-container');
    if (container) {
      const shopDomain = container.getAttribute('data-shop');
      console.log("Initializing Aerotex App Embed for:", shopDomain);
      // Fetch widget config from API and render here
      // For now, mockup a floating widget
      const widgetHtml = document.createElement('div');
      widgetHtml.className = 'aerotex-floating-widget modern-floating-icons bottom-right floating-anim';
      widgetHtml.innerHTML = `
        <a href="#" class="aerotex-icon" style="background: #E1306C" aria-label="Instagram">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="2" y="2" width="20" height="20" rx="5" ry="5"></rect><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"></path><line x1="17.5" y1="6.5" x2="17.51" y2="6.5"></line></svg>
        </a>
        <a href="#" class="aerotex-icon" style="background: #1DA1F2" aria-label="Twitter">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M23 3a10.9 10.9 0 0 1-3.14 1.53 4.48 4.48 0 0 0-7.86 3v1A10.66 10.66 0 0 1 3 4s-4 9 5 13a11.64 11.64 0 0 1-7 2c9 5 20 0 20-11.5a4.5 4.5 0 0 0-.08-.83A7.72 7.72 0 0 0 23 3z"></path></svg>
        </a>
      `;
      container.appendChild(widgetHtml);
    }

    // 2. Initialize App Blocks
    const blocks = document.querySelectorAll('.aerotex-widget-block');
    blocks.forEach(block => {
      const widgetId = block.getAttribute('data-widget-id');
      const shopDomain = block.getAttribute('data-shop');
      if (widgetId) {
        console.log("Initializing Aerotex App Block:", widgetId);
        // Fetch widget specific config and render
      }
    });

    // 3. Initialize Advanced ID Integration
    // To be implemented - search for saved CSS selectors and append widgets
  }

  document.addEventListener('DOMContentLoaded', initWidgets);
})();
