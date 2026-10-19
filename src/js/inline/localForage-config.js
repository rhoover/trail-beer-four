(() => {
  'use strict';

  localforage.config({
    name: 'VermontBeerTrail',
    storeName: 'brewerIDB',
    description: 'IndexedDB Storage of Brewer Trail Choices'
  });

  localforage.getItem('brewerIDB').then((idbState) => {
    if (idbState == null) {
      localforage.setItem('brewerIDB', []);
    };
  });

})();