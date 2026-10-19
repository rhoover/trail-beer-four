let map, customPin, infoWindow;

// change details text into json
let brewer = JSON.parse(document.querySelector('#detailData').textContent);

async function initMap() {
  // Request libraries when needed, not in the script tag as in the past
  const { Map, InfoWindow } = await google.maps.importLibrary("maps");
  const { PinElement, AdvancedMarkerElement } = await google.maps.importLibrary("marker");

  // The map, centered over Vermont, initialized before clicking the map button
  map = new Map(document.getElementById("map"), {
    center: {lat: brewer.latitude, lng: brewer.longitude},
    zoom: 10,
    mapId: 'ab7f61932fa6e8f0138653a4',
    mapTypeId: google.maps.MapTypeId.TERRAIN,
    zoomControl: true
  });

  // first, create a custom PinElement
  customPin = new PinElement({
    background: "#6A5ACD	",
    borderColor: "#B0C4DE	",
    glyphColor: "#B0C4DE",
    scale: 1.2
  });

    // then, create the marker
  const marker = new AdvancedMarkerElement({
    position:  {lat: brewer.latitude, lng: brewer.longitude},
    map : map,
    title: brewer.name,
    content: customPin,
    gmpClickable: true, 
  });

  infoWindow = new InfoWindow();

  // then populate the infoWindow for the marker
  let windowContent = `
    <img class="infowindow-image" src="/img/vtbt100/${brewer.selector}.png" alt="${brewer.name} Logo"/>
    <p class="infowindow-name">${brewer.name}</p>
    <p class="infowindow-address">${brewer.address}</p>
    <p class="infowindow-city">${brewer.city}</p>
  `;

  // open on page load
  infoWindow.close();
  infoWindow.setContent(windowContent);
  infoWindow.open(marker.map, marker);

  // clicking the marker
  marker.addEventListener('gmp-click', (event) => {
    // infoWindow.open(map, marker);
    infoWindow.close();
    infoWindow.setContent(windowContent);
    infoWindow.open(marker.map, marker);
  }); // end eventListener for marker
}; //end mapInit
initMap();