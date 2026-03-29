/**
 * MultiMesh Widget — Cross-Chain Swap Aggregator
 * Embed in 3 lines. Zero dependencies.
 * 
 * Usage:
 *   <div id="multimesh-widget"></div>
 *   <script src="https://multimesh.vercel.app/multimesh-widget.js"></script>
 *   <script>MultiMesh.init({ container: '#multimesh-widget' })</script>
 * 
 * Options:
 *   container:    CSS selector or DOM element (default: '#multimesh-widget')
 *   integrator:   Your app name for analytics (default: 'external')
 *   theme:        'dark' | 'light' (default: 'dark')
 *   accent:       Hex color e.g. '#00E5FF' (default: '#00E5FF')
 *   width:        Widget width (default: '420px')
 *   height:       Widget height (default: '560px')
 *   hideBranding: true | false (default: false)
 */

(function () {
  'use strict';

  var BASE_URL = 'https://multimesh.vercel.app';

  var MultiMesh = {
    init: function (options) {
      var opts = options || {};
      var container = opts.container || '#multimesh-widget';
      var el = typeof container === 'string' ? document.querySelector(container) : container;

      if (!el) {
        console.error('[MultiMesh] Container not found:', container);
        return;
      }

      var params = new URLSearchParams({
        integrator: opts.integrator || 'external',
        theme:      opts.theme       || 'dark',
        accent:     opts.accent      || '#00E5FF',
        hideBranding: String(opts.hideBranding || false),
      });

      var iframe = document.createElement('iframe');
      iframe.src = BASE_URL + '/widget?' + params.toString();
      iframe.style.width   = opts.width  || '420px';
      iframe.style.height  = opts.height || '560px';
      iframe.style.border  = 'none';
      iframe.style.borderRadius = opts.borderRadius || '20px';
      iframe.style.display = 'block';
      iframe.allow = 'clipboard-read; clipboard-write';
      iframe.setAttribute('loading', 'lazy');

      el.innerHTML = '';
      el.appendChild(iframe);

      return iframe;
    }
  };

  if (typeof window !== 'undefined') {
    window.MultiMesh = MultiMesh;
  }

  if (typeof module !== 'undefined' && module.exports) {
    module.exports = MultiMesh;
  }
})();