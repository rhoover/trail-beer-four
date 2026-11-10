(() => {
 'use-strict' 
  
  customElements.define('buttons-section', class extends HTMLElement {

    connectedCallback() {
      // initialize the things
      let buttonItems = document.querySelectorAll('.trail-tabs-item');

      // 'this' is/means the buttons-section
      this.addEventListener('click', (event) => {
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
        };

        // create data about which button was clicked
        // for dispatching below
        let sourceButtonClicked = {
          sourceData: buttonClicked.dataset.source
        };

        // communicate with panels web component
        this.dispatchEvent(new CustomEvent('toggle-panels', {
          detail: sourceButtonClicked,
          bubbles: true,
          composed: true
        })); // end dispatchEvent
      }); // end listener
    }; // end connectedCallback
  }); // end buttons section web component

  customElements.define('panels-section', class extends HTMLElement {

    connectedCallback() {
      // initialize the things
      let panelItems = document.querySelectorAll('.trail-panel');
      let listPanel = this.querySelector('[data-target="list"]');
      let trailPanel = this.querySelector('[data-target="trail"]');
      let mapPanel = this.querySelector('[data-target="map"]');
      let brewerCards = [...this.querySelectorAll('.trail-list-item')];
      let nothingOutput = '';
      let selectedOutput = '';
      let dataCache = null;

      function getStoredData() {
        return localforage.getItem('brewerIDB')
        .then(storedData => {
          if (storedData.length === 0) {
            nothingOutput += `
            <p class="trail-panel-notyet">Nothing to see here as you haven't chosen a distiller to visit :(. <br /><br /><span>Go on, do it!</span></p>
            `;
            trailPanel.innerHTML = nothingOutput;
            return;
          };
          return storedData;
        });
      };

      function initializeData() {
        getStoredData()
        .then(idbData => {
          dataCache = idbData;
          showTrailChecks(idbData);
          // createTrailPanel(idbData);
        })
      };
      initializeData();

      // for initial list view
      // function showTrailChecks(idbData) {
      function showTrailChecks(dataCache) {
   

      //     // get selectors from idb
          let selectors = new Set(dataCache.map(each => each.selector));

          let filteredDivs = brewerCards.filter(div => {
            let brewerValue = div.getAttribute('data-brewer');
            return selectors.has(brewerValue);
          });

      //     // Loop through each filtered <div> element
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
          console.log('fetched:', dataCache);
        
      }; // end showTrailChecks
 
      // listen globally for the dispatched custom event from when clicking a button
      // to display the appropriate panel
      document.addEventListener('toggle-panels', (event) => {
        let incomingData = event.detail.sourceData;

        togglePanelClasses(incomingData);
        function togglePanelClasses(incomingData) {
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
              createTrailPanel(dataCache);
              trailPanel.classList.add('trail-panel-active');
            break;
            case 'map':
              mapPanel.classList.add('trail-panel-active');
            break;
            default:
            break;
          }; // end switch
        }; // end togglePanelClasses

        function createTrailPanel(idbData) {

          // let idbData = await showTrailChecks();

          console.log('received:', idbData);
          

          idbData.sort( (a,b) => {
            if (a.selector > b.selector) {
              return 1;
            } else {
              return -1;
            };
          }); // end sort

          idbData.forEach(function(brewer) {
            selectedOutput += `
            <div class="trail-list-item" data-brewer="${brewer.selector}" id="${brewer.selector}">
              <span class="trail-list-item-logo ${brewer.selector}"></span>
              <div class="trail-list-item-meta">
                <p class="trail-list-item-name">${brewer.name}</p>
                <p class="trail-list-item-city">${brewer.city}</p>
              </div>
              <div class="trail-list-item-action">
                <p class="trail-list-item-remove" data-remove="${brewer.selector}"><svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 256 256' fill='red'><path d='M202.829 197.172a4 4 0 1 1-5.658 5.656L128 133.658l-69.171 69.17a4 4 0 0 1-5.658-5.656L122.343 128 53.171 58.828a4 4 0 0 1 5.658-5.656L128 122.342l69.171-69.17a4 4 0 0 1 5.658 5.656L133.657 128Z'/></svg></p>
              </div>
            </div>
            `;
        }); // end forEach building cards
        trailPanel.innerHTML = selectedOutput;
        }; // end createTrailPanel
      
        // make sure the list panel is up-to-date if clicking on list button
        function accurateList() {
          
          brewerCards.forEach(card => {
            // remove check marks in case of an update to idb
            let shownCheck = card.querySelector('.trail-list-item-check-selected');
            if (shownCheck) {
              shownCheck.classList.remove('trail-list-item-check-selected')
            }; // end if
          }); // end forEach
          // add check marks from updated idb
          showTrailChecks();
        }; // end accurateList

        function clearTrail() {
          let trailItems = trailPanel.querySelectorAll('.trail-list-item');
          console.log(trailItems);
          
          trailItems.forEach(item => item.remove());
        };
      }); // end eventListener
    }; // end connectedCallback
  }); // end panels section web component

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