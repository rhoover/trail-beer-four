(() => {
 'use-strict' 
  
  let brewerCards = [...document.querySelectorAll('.list-item')];

  function initialListRender () {
    localforage.getItem('brewerIDB')
    .then(fetchedData => {
      return fetchedData;
    })
    .then(fetchedData => {
      if (fetchedData.length === 0) {return;};
      initialData = fetchedData;
      showTrailChecks(initialData);
    });
  };
  initialListRender();

  function showTrailChecks(initialData) {
    
    // get selectors from idb
    let selectors = new Set(initialData.map(each => each.selector));

    let filteredDivs = brewerCards.filter(div => {
      let brewerValue = div.getAttribute('id');
      return selectors.has(brewerValue);
    });

    filteredDivs.forEach(summary => {
      let checkElement = summary.querySelector('.list-item-check');
      checkElement.innerHTML = '&#10003 Is In Your Trail';
    });
    
  };

  // which brewer are you clicking to add to trail
  document.addEventListener('click', (event) => {
    let trailBrewer = event.target.closest('.list-item-trail');

    if (!trailBrewer) {return};

    // add to summary at top of detail item
    let detailElement = event.target.closest('.list-item');
    let checkEl = detailElement.querySelector('.list-item-summary .list-item-check');
    checkEl.innerHTML = '&#10003 Is In Your Trail';

    let brewerToSearch = trailBrewer.getAttribute('data-add');

    getServerData(brewerToSearch);
  }); // end listener

  async function getServerData(brewerToSearch) {
    let url = `https://vtbeertrail.com/server/search-data.php?q=${encodeURIComponent(brewerToSearch)}`;
      
    try {
      const response = await fetch(url);
      
      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }
      
      // Response parsing is asynchronous
      let selectedBrewer = await response.json();

      checkTrail(selectedBrewer[0]);
      
    } catch (error) {
      console.error('Error fetching data:', error);
    };
  };

  function checkTrail(brewerObject) {
    // let brewerObject = selectedBrewer[0];

    localforage.getItem('brewerIDB').then((idbData) => {return idbData})
    .then((idbData) => {
      let idbState = null;
      let targetModal = null;
      // convert NodeList into an array
      let theModals = [...document.querySelectorAll('[data-modal]')];

      if (idbData.length === 0) {
        addToTrail(idbData, brewerObject);

        targetModal = theModals.find(el => el.dataset.modal === 'success');
        doModal(brewerObject, targetModal)
      } else {
        
        idbState = idbData.find(brewer => brewer.selector === brewerObject.selector);
        
        if (idbState) {
          targetModal = theModals.find(el => el.dataset.modal === 'fail');
          doModal(brewerObject, targetModal);
        } else {
          addToTrail(idbData, brewerObject);

          targetModal = theModals.find(el => el.dataset.modal === 'success');
          doModal(brewerObject, targetModal);
        };
      };
    });
  }; // end checkTrail

  async function addToTrail(idbData, brewerObject) {

    try {
      console.log('try  expression adding to idb', brewerObject);

      idbData.push(brewerObject)

      // 3. Attempt the write 
      await localforage.setItem('brewerIDB', idbData);
      console.log("🎉 Successfully wrote to IndexedDB!");

    } catch (error) {
      // 4. Catch the exact hidden internal error
      console.error("❌ IndexedDB Error Type:", error.name);
      console.error("❌ Error Message:", error.message);
    };
  }; // end addToTrail

  function doModal(brewerObject, whichModal) {
    console.log('doModal:', whichModal, brewerObject);

    let theModalToModify = whichModal.getAttribute('data-modal');
    console.log('which modal to modify:', theModalToModify);

    let failMarkUp = `
      <img src="${brewerObject.vtbt100}" alt="${brewerObject.name} logo" class="modal-image" width="100" height="100">
      <p class="modal-congrats">Congratulations on choosing ${brewerObject.name}.</p>
      <p class="modal-congrats-two">But they are already in your trail collection.</p>
      <a href="/brewers-trail.html" class="modal-link">Check out your personal trail.</a>
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32" class="modal-icon"  stroke-linecap="round" stroke-linejoin="round" stroke-width="2"><path d="M2 30 L30 2 M30 30 L2 2" /></svg> 
    `;

    let successMarkUp = `
      <img src="${brewerObject.vtbt100}" alt="${brewerObject.name} Logo" class="modal-image" width="100" height="100">
      <p class="modal-congrats">Congratulations on choosing ${brewerObject.name}.</p>
      <p class="modal-text">They do wonderful work!</p>
      <a href="/brewers-trail.html" class="modal-link">Check out your personal trail.</a>
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32" class="modal-icon"  stroke-linecap="round" stroke-linejoin="round" stroke-width="2"><path d="M2 30 L30 2 M30 30 L2 2" /></svg>    
    `;

    switch (theModalToModify) {
      case 'fail':
        whichModal.insertAdjacentHTML('afterbegin', failMarkUp);
        // whichModal.classList.add('modal-open');
        whichModal.showModal();
        closeModal(whichModal);
      break;
      case 'success':
        whichModal.insertAdjacentHTML('afterbegin', successMarkUp);
        // whichModal.classList.add('modal-open');
        whichModal.showModal();
        closeModal(whichModal);
      break;
      default:
      break;
    }; // end switch
  }; // end doModal

  function closeModal(whichModal) {
    whichModal.addEventListener('click', (event) => {
      // whichModal.classList.remove('modal-open');
      whichModal.close();
      whichModal.replaceChildren();
    });
  };

})();