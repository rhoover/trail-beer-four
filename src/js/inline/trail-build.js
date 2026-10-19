(() => {
 'use-strict' 
  
 const trailBuilding = {
  init() {


    localforage.getItem('brewerIDB').then((idbData) => {return idbData})
    .then((idbData) => {
      let listPanel = document.querySelector('[data-target="list"]');
      let trailPanel = document.querySelector('[data-target="trail"]');
      trailBuilding.clickingToAdd(idbData, listPanel, trailPanel);
      trailBuilding.removeFromTrail(trailPanel, idbData);
    });
  },

  clickingToAdd(idbData, listPanel, trailPanel) {

    listPanel.addEventListener('click', (event) => {

      // capture clicking in the searchbox, as it is also inside listPanel
      let clickedSearch = event.target.closest('.trail-list-search');
      if (clickedSearch) {return};

      // capture clicking add sign that is not visible but still there
      let wrongAdd = event.target.previousElementSibling;
      if (wrongAdd.classList.contains('trail-list-item-check-selected')) {return};

      // get the selector of the clicked-on brewer card
      let clickedBrewer = event.target.closest('.trail-list-item').dataset.brewer;
      getDataFromServer(clickedBrewer, event);
    });

    // get the brewer object from the json on the server
    // to push into trail array
    async function getDataFromServer(clickedBrewer, event) {

      let url = `https://vtbeertrail.com/server/search-data.php?q=${encodeURIComponent(clickedBrewer)}`;
      
      try {
        const response = await fetch(url);
        
        if (!response.ok) {
          throw new Error(`HTTP error! Status: ${response.status}`);
        }
        
        // Response parsing is asynchronous
        let selectedBrewer = await response.json();

        // show the checkmark on the clicked card
        event.target.closest('.trail-list-item').querySelector('.trail-list-item-check').classList.add('trail-list-item-check-selected');

        event.target.closest('.trail-list-item').querySelector('.trail-list-item-add').classList.add('trail-list-item-no-add');
    
        trailBuilding.saveToTrail(selectedBrewer[0], idbData);
        trailBuilding.removeFromTrail(trailPanel, idbData);
        
      } catch (error) {
        console.error('Error fetching data:', error);
      };
    }; // end async function
  },

  saveToTrail(newBrewer, idbData) {
    idbData.push(newBrewer);        
    localforage.setItem('brewerIDB', idbData)
  },

  // updateTrailPanel(newBrewer, trailPanel) {
    
  //   trailPanel.insertAdjacentHTML('beforeend', 
  //     `<div class="trail-list-item" data-brewer="${newBrewer.selector}" id="${brewer.selector}">
  //       <span class="trail-list-item-logo ${newBrewer.selector}"></span>
  //       <div class="trail-list-item-meta">
  //         <p class="trail-list-item-name">${newBrewer.name}</p>
  //         <p class="trail-list-item-city">${newBrewer.city}</p>
  //       </div>
  //       <div class="trail-list-item-action">
  //         <p class="trail-list-item-remove" data-remove="${newBrewer.selector}"><svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 256 256' fill='red'><path d='M202.829 197.172a4 4 0 1 1-5.658 5.656L128 133.658l-69.171 69.17a4 4 0 0 1-5.658-5.656L122.343 128 53.171 58.828a4 4 0 0 1 5.658-5.656L128 122.342l69.171-69.17a4 4 0 0 1 5.658 5.656L133.657 128Z'/></svg></p>
  //       </div>
  //     </div>`
  //   ); // end insert HTML
  // },

  removeFromTrail(trailPanel, idbData) {
    
    trailPanel.addEventListener('click', clickToRemove, true);
    function clickToRemove(event) {

      let deleteTheBrewer = event.target.closest('.trail-list-item').dataset.brewer;

      // update liist panel
      trailBuilding.updateListPanel(deleteTheBrewer);

      event.target.closest('.trail-list-item').classList.add('trail-list-item-slide');
      setTimeout(() => {
        event.target.closest('.trail-list-item').remove();
      }, 800);

      let indexOfBrewer = idbData.findIndex(object => {
        return object.selector === deleteTheBrewer;
      });
      idbData.splice(indexOfBrewer, 1);
      localforage.setItem('brewerIDB', idbData);
    }; // end clickToRemove
  },
  
  updateListPanel(deleteTheBrewer) {
    let brewerToChange = document.querySelector(`[data-brewer="${deleteTheBrewer}"]`);

    let changeCheck = brewerToChange.querySelector('.trail-list-item-check-selected');
    let changeAdd = brewerToChange.querySelector('.trail-list-item-no-add');
    
    changeCheck.classList.remove('trail-list-item-check-selected');
    changeAdd.classList.remove('trail-list-item-no-add');
  }// end updateListPanel
 };
trailBuilding.init();
})();