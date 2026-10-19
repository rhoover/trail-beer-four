(() => {
  'use strict';
  if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
      navigator.serviceWorker.register('/beertrail-service-worker-min.js');
    });
  };
})();