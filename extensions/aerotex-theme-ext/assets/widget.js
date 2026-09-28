console.log("Aerotex Widgets Theme Extension Loaded.");

(function() {
  const AppDomain = "https://aerotex-widgets.vercel.app";

  const ICONS = {
    facebook: '<svg viewBox="0 0 24 24" fill="#1877F2"><path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.469h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.469h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/></svg>',
    instagram: '<svg viewBox="0 0 24 24" fill="url(#instagram-grad)"><defs><linearGradient id="instagram-grad" x1="0%" y1="100%" x2="100%" y2="0%"><stop offset="0%" stop-color="#fdf497"/><stop offset="5%" stop-color="#fdf497"/><stop offset="45%" stop-color="#fd5949"/><stop offset="60%" stop-color="#d6249f"/><stop offset="90%" stop-color="#285AEB"/></linearGradient></defs><path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.203 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z"/></svg>',
    whatsapp: '<svg viewBox="0 0 24 24" fill="#25D366"><path d="M12.031 0C5.397 0 0 5.398 0 12.035c0 2.12.552 4.186 1.597 6.002L.15 23.85l5.962-1.563A11.968 11.968 0 0012.031 24c6.634 0 12.036-5.399 12.036-12.035S18.666 0 12.031 0zm0 21.986c-1.815 0-3.593-.487-5.15-1.411l-.369-.22-3.829 1.004 1.025-3.73-.241-.384A9.972 9.972 0 012.015 12.03c0-5.525 4.498-10.024 10.023-10.024 5.524 0 10.023 4.499 10.023 10.024 0 5.525-4.499 10.024-10.024 10.024zm5.503-7.518c-.302-.151-1.787-.881-2.064-.982-.276-.1-.478-.151-.679.15-.201.302-.781.983-.956 1.184-.176.202-.352.227-.654.076-.301-.151-1.275-.47-2.43-1.503-.898-.804-1.504-1.796-1.68-2.098-.176-.301-.019-.464.132-.614.135-.135.301-.352.453-.528.15-.176.201-.301.301-.502.1-.202.05-.378-.025-.529-.076-.151-.679-1.634-.93-2.238-.246-.59-.496-.511-.679-.52-.176-.008-.378-.009-.579-.009s-.528.075-.805.377c-.276.302-1.055 1.031-1.055 2.516s1.08 2.918 1.231 3.12c.15.201 2.128 3.249 5.155 4.557.719.31 1.28.495 1.718.634.721.23 1.378.197 1.895.12.58-.086 1.787-.73 2.038-1.434.251-.705.251-1.309.176-1.435-.075-.126-.276-.201-.578-.352z"/></svg>',
    phone: '<svg viewBox="0 0 24 24" fill="#34D399"><path d="M22.56 16.3l-3.3-1.65a2.23 2.23 0 0 0-2.58.46l-1.56 1.56a15.82 15.82 0 0 1-7.23-7.23l1.56-1.56a2.23 2.23 0 0 0 .46-2.58l-1.65-3.3A2.25 2.25 0 0 0 6.06 1H2.63A1.5 1.5 0 0 0 1.12 2.59 19.5 19.5 0 0 0 21.41 22.88 1.5 1.5 0 0 0 23 21.37v-3.43a2.25 2.25 0 0 0-1.44-2.14z"/></svg>',
    email: '<svg viewBox="0 0 24 24" fill="#F87171"><path d="M22 6c0-1.1-.9-2-2-2H4c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6zm-2 0l-8 5-8-5h16zm0 12H4V8l8 5 8-5v10z"/></svg>',
    messenger: '<svg viewBox="0 0 24 24" fill="#00B2FF"><path d="M12 2C6.477 2 2 6.145 2 11.258c0 2.91 1.505 5.503 3.844 7.218V22l3.504-1.926c.846.234 1.737.36 2.652.36 5.522 0 10-4.145 10-9.258S17.522 2 12 2zm1.18 12.046l-2.548-2.723-4.966 2.723 5.45-5.786 2.6 2.723 4.908-2.723-5.444 5.786z"/></svg>',
  };

  function renderWidget(container, widgetId, design, iconSize, spacing, position) {
    let sizePx = iconSize === 'Small' ? '24px' : iconSize === 'Large' ? '48px' : '36px';
    let gapPx = spacing === 'Compact' ? '8px' : spacing === 'Spacious' ? '16px' : '12px';
    let flexDir = position === 'Left Center' || design.includes('Social Bar') ? 'row' : 'column';
    
    // For now, render mockup default icons directly to prove it works immediately in theme editor
    // In production, we would `fetch(AppDomain + "/api/widgets/" + widgetId)` to get actual user links
    const widgetHtml = document.createElement('div');
    widgetHtml.style.display = 'flex';
    widgetHtml.style.flexDirection = flexDir;
    widgetHtml.style.gap = gapPx;
    widgetHtml.style.position = 'fixed';
    widgetHtml.style.zIndex = '999999';
    widgetHtml.style.transition = 'all 0.3s ease';

    if (design.includes('Glass')) {
      widgetHtml.style.background = 'rgba(255,255,255,0.7)';
      widgetHtml.style.backdropFilter = 'blur(10px)';
      widgetHtml.style.padding = '12px';
      widgetHtml.style.borderRadius = '24px';
      widgetHtml.style.boxShadow = '0 4px 12px rgba(0,0,0,0.1)';
    } else {
      widgetHtml.style.background = '#fff';
      widgetHtml.style.padding = '12px';
      widgetHtml.style.borderRadius = '24px';
      widgetHtml.style.boxShadow = '0 4px 12px rgba(0,0,0,0.15)';
    }

    if (position === 'Bottom Left') {
      widgetHtml.style.bottom = '20px'; widgetHtml.style.left = '20px';
    } else if (position === 'Top Right') {
      widgetHtml.style.top = '20px'; widgetHtml.style.right = '20px';
    } else if (position === 'Left Center') {
      widgetHtml.style.top = '50%'; widgetHtml.style.left = '20px'; widgetHtml.style.transform = 'translateY(-50%)';
    } else {
      widgetHtml.style.bottom = '20px'; widgetHtml.style.right = '20px';
    }

    ['whatsapp', 'instagram', 'facebook'].forEach(key => {
      let iconWrapper = document.createElement('div');
      iconWrapper.style.width = sizePx;
      iconWrapper.style.height = sizePx;
      iconWrapper.style.cursor = 'pointer';
      iconWrapper.style.transition = 'transform 0.2s';
      iconWrapper.onmouseenter = () => iconWrapper.style.transform = 'scale(1.1)';
      iconWrapper.onmouseleave = () => iconWrapper.style.transform = 'scale(1)';
      iconWrapper.innerHTML = ICONS[key];
      widgetHtml.appendChild(iconWrapper);
    });

    container.appendChild(widgetHtml);
  }

  function initWidgets() {
    const blocks = document.querySelectorAll('.aerotex-widget-block');
    blocks.forEach(block => {
      const widgetId = block.getAttribute('data-widget-id');
      const design = block.getAttribute('data-design');
      const iconSize = block.getAttribute('data-icon-size');
      const spacing = block.getAttribute('data-spacing');
      const position = block.getAttribute('data-position');
      
      const target = block.querySelector('.aerotex-render-target');

      if (widgetId && target) {
        // Clear previous renders (useful inside theme editor)
        target.innerHTML = '';
        renderWidget(target, widgetId, design, iconSize, spacing, position);
      }
    });
  }

  // Run on load
  document.addEventListener('DOMContentLoaded', initWidgets);

  // In Shopify Theme Editor, this event fires when block settings are changed
  document.addEventListener('shopify:section:load', initWidgets);
  document.addEventListener('shopify:block:select', initWidgets);
  document.addEventListener('shopify:block:deselect', initWidgets);
})();
