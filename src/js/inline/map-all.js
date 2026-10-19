import brewers from '/_data/brewers.json' with {type: 'json'};

// first sort so list in map looks right
brewers.sort(function(a,b) {
  if (a.selector < b.selector)
    return -1
  if (a.selector > b.selector)
    return 1
  return 0
});

// needed to have list items pop open correct infowindow
let markers = [];
let infoContents = [];

async function initMap() {
  // Request libraries when needed, not in the script tag as in the past
  const { Map, InfoWindow } = await google.maps.importLibrary("maps");
  const { PinElement, AdvancedMarkerElement } = await google.maps.importLibrary("marker");

  // The map, centered over Vermont, initialized
  const map = new Map(document.getElementById("map"), {
      center: {lat: 44.0407, lng: -72.7093},
      zoom: 8,
      mapId: 'ab7f61932fa6e8f0138653a4',
      mapTypeId: google.maps.MapTypeId.TERRAIN,
      zoomControl: true
  });

  // then create the infoWindow
  const infowindow = new InfoWindow();

  // then initialize the custom control to browse list of brewers
  function createListControl() {
    const controlButton = document.createElement("input");
    controlButton.type = 'button';
    controlButton.value = 'Browse List of Brewers';
    // Set CSS for the control.
    // controlButton.style.backgroundColor = "rgb(250,250,250)";
    controlButton.style.backgroundColor = "rgba(0,0,250, 0.75)";
    controlButton.style.border = "1px solid #FFFFFF";
    controlButton.style.borderRadius = "0.25rem";
    controlButton.style.color = "rgb(250,250,250)";
    controlButton.style.cursor = "pointer";
    controlButton.style.fontFamily = "assistantLight, Roboto,Arial,sans-serif";
    controlButton.style.fontSize = "16px";
    controlButton.style.lineHeight = "38px";
    controlButton.style.margin = "8px 0 22px -70px";
    controlButton.style.padding = "3px 10px";
    controlButton.style.textAlign = "center";
    controlButton.title = "Browse List of Brewers";
    // event listener for clicking on the custom control, to access the DOM outside the map
    controlButton.addEventListener('click', () => {
      if (controlButton.value == 'Browse List of Brewers') {
        document.querySelector('.map-container').classList.add('map-container-open');
        controlButton.value = 'Close List';
      } else {
        document.querySelector('.map-container').classList.remove('map-container-open');
        controlButton.value = 'Browse List of Brewers';
      };
    });
    return controlButton;
  }; // end createListControl()

  // then create the DIV to hold the control button
  const listDiv = document.createElement("div");
  // Create the control
  const listControl = createListControl();
  // Append the control to the DIV.
  listDiv.appendChild(listControl);
  map.controls[google.maps.ControlPosition.BOTTOM_LEFT].push(listDiv);

  // then create the DIV to hold the side list
  let sideDiv = document.createElement('div');
  sideDiv.classList.add('map-list');
  let mainMap = document.querySelector('.map-container');
  mainMap.prepend(sideDiv);

  // then do the thing
  brewers.forEach((brewer, index) => {
    
    // first, create a custom PinElement
    const customPin = new PinElement({
      background: "#6A5ACD	",
      borderColor: "#B0C4DE	",
      glyphColor: "#B0C4DE",
      scale: 1.2
    });

    // then create the markers
    const marker = new AdvancedMarkerElement({
      position: {lat: brewer.latitude, lng: brewer.longitude},
      map: map,
      title: brewer.name,
      content: customPin,
      gmpClickable: true
    });

    // needed below for list
    markers.push(marker);

    // content for infoWindow
    const infoInfo = `
        <img class="infowindow-image" src="/img/vtbt100/${brewer.selector}.png" alt="${brewer.name} Logo"/>
        <p class="infowindow-name">${brewer.name}</p>
        <p class="infowindow-address">${brewer.address}</p>
        <p class="infowindow-city">${brewer.city}</p>
        <a class="infowindow-link" href="/pages/list.html#${brewer.selector}">View Brewer Details</a>
        <button class="infowindow-addbutton" data-selector="${brewer.selector}">Add To Your Trail</button>
    `;

    // needed below for list
    infoContents.push(infoInfo);

    // clicking the marker
    marker.addEventListener('gmp-click', (event) => {
      infowindow.close();
      infowindow.setContent(infoInfo);
      // infowindow.open(map, marker);
      infowindow.open(marker.map, marker);
    }); // end eventListener for marker

    // create the side list
    sideDiv.innerHTML += `
      <div class="map-list-item" data-marker-index="${index}" selector-top="${brewer.selector}">
        <span class="map-list-item-logo ${brewer.selector}"></span>
        <p class="map-list-item-name">${brewer.name}</p>
        <p class="map-list-item-city">${brewer.city}</p>
      </div>
      `;
  }); // end forEach

  // finally, connecting the side list to proper marker
  sideDiv.addEventListener('click', (event) => {
    // just one listener
    let listItem = event.target.closest('[selector-top');

    let markerIndex = parseInt(listItem.dataset.markerIndex);
    let selectedMarker = markers[markerIndex];

    infowindow.setContent(infoContents[markerIndex]);
    infowindow.open(map, selectedMarker);
    document.querySelector('.map-container').classList.remove('map-container-open');
    document.querySelector('[value="Close List"]').setAttribute('value', 'Browse List');
  });

  // add to trail stuff, now that the infowindow is open
  google.maps.event.addListener(infowindow, 'domready', addToTrail);

  // heavy lifting
  function addToTrail() {
    const addButton = document.querySelector('.infowindow-addbutton');

    addButton.addEventListener('click', () => {
      // as found in DOM
      const selector = addButton.dataset.selector;

      // getting the db
      localforage.getItem('brewerIDB').then( (idbData) => {
        // send off
        handleData(idbData, selector);
      }); // end localforage

      function handleData(idbData, selector) {
        // go looking
        const maybeInThere = idbData.find( brewer => brewer.selector === selector);

        // if it's already in there, this means yes
        if (maybeInThere) {
          alert(`${maybeInThere.name} is already in your personal trail!`);
        // and this means no as 'undefined' was returned by the find()
        } else {
          // so go looking in distillers full json from server as used above in making the map and markers
          const inJSON = brewer.find(brewers => brewer.selector === selector);

          // and add new selection to idb data currently in memory
          idbData.push(inJSON);

          // tell them
          alert(`${inJSON.name} has been added to your personal trail!`);

          // then do it
          localforage.setItem('brewerIDB', idbData);
        };
      }; // end handleData()
    }); // end addButton event listener
  }; // end addToTrail()
}; // end initMap
initMap();