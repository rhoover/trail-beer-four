import myData from '/_data/brewers.json' with {type: 'json'};


((artisanData) => {
  'use strict';

  let searchInput = document.getElementById('searchbox');
  let resultsList = document.querySelector('.home-search-results');
  let searchQuery;

  window.addEventListener('beforeunload', (event) => {
    searchInput.value = '';
  });

  decideAndSearch();
  function decideAndSearch() {

    ['focus', 'blur', 'keyup', 'input'].forEach(event => searchInput.addEventListener(event, doSomething));

    function doSomething(e) {
      let happening = e.type;

      switch (happening) {
        case 'focus':
        resultsList.classList.add('home-search-results-active');
        break;
        case 'blur':
          resultsList.classList.remove('home-search-results-active');
          setTimeout(() => {
            searchInput.value = '';
            resultsList.innerHTML = '';              
          }, 1000);
        break;
        case 'keyup':
          searchQuery = searchInput.value.toLowerCase();
          resultsList.innerHTML = '';

          // https://stackoverflow.com/questions/69917128/how-to-search-a-json-file-from-a-search-bar-in-html
          for (let i = 0; i < myData.length; i++) {
            let obj = myData[i];

            // send the results to the displayResults function to display them
            if (obj.name.toLowerCase().includes(searchQuery) || obj.city.toLowerCase().includes(searchQuery)) {
              displayResults(obj);
            };
          };
        break;
        case 'input':
          if (searchInput.value.length == 0) {
          resultsList.innerHTML = '';          
          };
        break;
        default:
        break;
      }; //end switch
    }; // end doSomething()
  }; // end decideAndSearch

  function displayResults(results) {
    let link = document.createElement('a');
    link.setAttribute('href', `/pages/brewers-list.html#${results.selector}`);
    link.className = `home-search-results-link`;
    link.innerHTML = `<span class="home-search-resulrs-text">${results.name} - ${results.city}</span>`;
    link.innerHTML += `<span class="home-search-results-arrow">➤</span>`;
    resultsList.appendChild(link);
  }; // end displayResults()

})(myData);
