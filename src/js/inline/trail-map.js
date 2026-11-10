(() => {
 'use-strict' 
  
let map;
let mapButton = document.querySelector('[data-source="map"]');
let brewers;

// initMap is now async
async function initMap() {

  // Request libraries when needed, not in the script tag as in the past
  const { Map, InfoWindow } = await google.maps.importLibrary("maps");
  const { PinElement, AdvancedMarkerElement } = await google.maps.importLibrary("marker");

  // get the data for the pins to be added to the already initialized map
  mapButton.addEventListener('click', () => {

    // The map, centered over Vermont, initialized when clicking the map button so changes to chosen brewers are shown
    map = new Map(document.getElementById("map"), {
      center: {lat: 44.0407, lng: -72.7093},
      zoom: 8,
      mapId: 'ab7f61932fa6e8f0138653a4',
      mapTypeId: google.maps.MapTypeId.TERRAIN,
      zoomControl: true
    });
    //get brewers idb data
    async function sendData() {
      brewers = await localforage.getItem('brewerIDB');
      return brewers;
    };
    // send the data out of the event listener
    sendData().then((brewers) => {
      makeTheMap(brewers);
    });
  }); // end eventlistener

  // create the final map
  function makeTheMap(brewers) {
    // if no db stuff, bail
    if (brewers === null || brewers.length == 0) {
      return;
    } else {
      // https://jsfiddle.net/gh/get/library/pure/googlemaps-samples/js-api-samples/tree/main/dist/samples/advanced-markers-accessibility/jsfiddle
      // Create an info window to share between markers.
      const infoWindow = new InfoWindow();

      // create the pin(s)
      brewers.forEach( (brewer) => {

        const customPin = new PinElement({
          background: "#6A5ACD	",
          borderColor: "#B0C4DE	",
          glyphColor: "#B0C4DE",
          scale: 1.2
        });

        // then, create each marker
        const marker = new AdvancedMarkerElement({
          position: {lat: brewer.latitude, lng: brewer.longitude},
          map : map,
          title: brewer.name,
          content: customPin,
          gmpClickable: true, 
        });

        // then populate each infoWindow for each marker
        let windowContent = `
          <img class="infowindow-image" src="/img/vtbt100/${brewer.selector}.png" alt="${brewer.name} Logo"/>
          <p class="infowindow-name">${brewer.name}</p>
          <p class="infowindow-address">${brewer.address}</p>
          <p class="infowindow-city">${brewer.city}</p>
          <a class="infowindow-link" href="/pages/list.html#${brewer.selector}">View Brewer Details</a>
        `;

        // add a click listener for each marker, and set up the info window.
        marker.addEventListener('gmp-click', (event) => {
          // const { target } = domEvent;
          infoWindow.close();
          infoWindow.setContent(windowContent);
          infoWindow.open(marker.map, marker);
        }); // end listener
      }); // end forEach
    }; // end if-else
  }; // end makeTheMap
}; // end initMap
initMap();
})();