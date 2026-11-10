(() => {
 'use-strict' 

  // initialize the things
  let panelItems = document.querySelectorAll('.trail-panel');
  let listPanel = document.querySelector('[data-target="list"]');
  let trailPanel = document.querySelector('[data-target="trail"]');
  let mapPanel = document.querySelector('[data-target="map"]');
  let brewerCards = [...listPanel.querySelectorAll('.trail-list-item')];
  let buttonRow = document.querySelector('.trail-tabs-row');
  let buttonItems = document.querySelectorAll('.trail-tabs-item');
  let nothingOutput = '';
  let initialData = null;

  function initialListRender () {
    localforage.getItem('brewerIDB')
    .then(fetchedData => {
      return fetchedData;
    })
    .then(fetchedData => {
      if (fetchedData.length === 0) {
        nothingOutput += `
        <p class="trail-panel-notyet">Nothing to see here as you haven't chosen a distiller to visit :(. <br /><br /><span>Go on, do it!</span></p>
        `;
        trailPanel.innerHTML = nothingOutput;
        return;
      };
      initialData = fetchedData;
      showTrailChecks(initialData);
    });
  };
  initialListRender();

  function showTrailChecks(initialData) {

    // get selectors from idb
    let selectors = new Set(initialData.map(each => each.selector));

    let filteredDivs = brewerCards.filter(div => {
      let brewerValue = div.getAttribute('data-brewer');
      return selectors.has(brewerValue);
    });

      // Loop through each filtered <div> element
    filteredDivs.forEach(div => {
      // Find the specific span element inside the current div
      let checkSpan = div.querySelector('.trail-list-item-check');
      let addSpan = div.querySelector('.trail-list-item-add');
      
      // If the span exists, add your new class list
      if (checkSpan) {
        checkSpan.classList.add('trail-list-item-check-selected');
        addSpan.classList.add('trail-list-item-no-add');
      }; // end if
    }); // end forEach

    selectors = null;
  };

  // also generate custom event 'toggle-panels'
  buttonRow.addEventListener('click', (event) => {
    let buttonClicked = event.target;

    // ignore currently active button
    if (buttonClicked.matches('.trail-tabs-item-active')) return;

    toggleButtonClasses(buttonClicked);
    function toggleButtonClasses(buttonClicked) {
      buttonItems.forEach((button) => {
        if (button.classList.contains('trail-tabs-item-active')) {
          button.classList.remove('trail-tabs-item-active');
        };
      }); // end forEach
      // then add new active class to clicked button
      buttonClicked.classList.add('trail-tabs-item-active');
    }; // end toggle buttons

    // create data about which button was clicked
    // for dispatching below
    let sourceButtonClicked = {
      sourceData: buttonClicked.dataset.source
    };

    //create custom event to toggle panels
    let buttonEvent = new CustomEvent('toggle-panels', {
      detail: sourceButtonClicked,
      bubbles: true,
      composed: true
    });
    document.dispatchEvent(buttonEvent);
  }); // end button row listener

  document.addEventListener('toggle-panels', (event) => {

    let incomingData = event.detail.sourceData;

    panelItems.forEach((panel) => {
      if (panel.classList.contains('trail-panel-active')) {
        panel.classList.remove('trail-panel-active');
      };
    }); // end forEach

    switch (incomingData) {
      case 'list':
        listPanel.classList.add('trail-panel-active');
        // make sure the list panel is up-to-date if clicking on list button
        accurateList();
        clearTrail();
      break;
      case 'trail':
        createTrailPanel();
        trailPanel.classList.add('trail-panel-active');
      break;
      case 'map':
        mapPanel.classList.add('trail-panel-active');
      break;
      default:
      break;
    }; // end switch
  }); // end listener

  function createTrailPanel() {

    let selectedOutput = '';

    localforage.getItem('brewerIDB')
    .then((data) => {
      return data;
    })
    .then((data) => {
      renderTrailPanel(data);
    });

    function renderTrailPanel(newData) {

      newData.sort( (a,b) => {
        if (a.selector > b.selector) {
          return 1;
        } else {
          return -1;
        };
      }); // end sort

      newData.forEach(function(brewer) {
        selectedOutput += `
        <div class="trail-list-item" data-brewer="${brewer.selector}" id="${brewer.selector}">
          <span class="trail-list-item-logo ${brewer.selector}"></span>
          <div class="trail-list-item-meta">
            <p class="trail-list-item-name">${brewer.name}</p>
            <p class="trail-list-item-city">${brewer.city}</p>
          </div>
          <div class="trail-list-item-action">
            <p class="trail-list-item-remove" data-remove="${brewer.selector}"><svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 256 256' fill='red' class="delete-brewer"><path d='M202.829 197.172a4 4 0 1 1-5.658 5.656L128 133.658l-69.171 69.17a4 4 0 0 1-5.658-5.656L122.343 128 53.171 58.828a4 4 0 0 1 5.658-5.656L128 122.342l69.171-69.17a4 4 0 0 1 5.658 5.656L133.657 128Z'/></svg></p>
          </div>
        </div>
        `;
      }); // end forEach building cards
      trailPanel.innerHTML = selectedOutput;
      const renderEvent = new CustomEvent('dataRendered');
      document.dispatchEvent(renderEvent);
    };
  }; // end createTrailPanel

  // delete entries in trail panel to avoid duplication
  function clearTrail() {
    let trailItems = trailPanel.querySelectorAll('.trail-list-item');
    trailItems.forEach(item => item.remove());
  }; // end clearTrail

  // make sure the list panel is up-to-date if clicking on list button
  function accurateList() {
    
    brewerCards.forEach(card => {
      // remove check marks in case of an update to idb
      let shownCheck = card.querySelector('.trail-list-item-check-selected');
      if (shownCheck) {
        shownCheck.classList.remove('trail-list-item-check-selected')
      }; // end if
    }); // end forEach

    // re-initialize fetched data to update list panel
    localforage.getItem('brewerIDB')
    .then(newFetchedData => {
      return newFetchedData;
    })
    .then(newFetchedData => {
      initialData.length = 0;
      initialData.push(...newFetchedData);
      showTrailChecks(initialData);
    });
  }; // end accurateList

  function listSearch() {

    // need this as a NodeList to modify the dom
    let listCards = document.querySelectorAll('.trail-list-item');
    let searchInput = document.getElementById('searchbox');

    function liveSearch() {
      let searchQuery = searchInput.value;

      for (let i = 0; i < listCards.length; i++) {
        
        // if the text is within the card and matches the search query, remove class, otherwise add class
        listCards[i].classList[listCards[i].innerText.toLowerCase().includes(searchQuery.toLowerCase())
        ?
        'remove'
        :
        'add']('is-hidden');

      };
    };

    // a little delay
    let typingTimer;
    let typeInterval = 250;

    searchInput.addEventListener('keyup', () => {
      clearTimeout(typingTimer);
      typingTimer = setTimeout(liveSearch, typeInterval);
    });

    // clearing the input box
    searchInput.addEventListener('search', () => {
      for (let i = 0; i < listCards.length; i++) {
        listCards[i].classList.remove('is-hidden');
      };
    });
  
  };
  listSearch();
})();