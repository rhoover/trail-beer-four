(() => {
'use strict';

  let listCards = document.querySelectorAll('.list-item');
  let searchInput = document.getElementById('searchbox');

  function liveSearch() {
    let searchQuery = searchInput.value;

    for (let i = 0; i < listCards.length; i++) {
      
      // if the text is within the card and matches the search query, remove class, otherwise add class
      listCards[i].classList[
      listCards[i].innerText.toLowerCase().includes(searchQuery.toLowerCase())
      ?
      'remove'
      :
      'add']('is-hidden');

    };
  };

  // a little delay
  let typingTimer;
  let typeInterval = 250;
  
  searchInput.addEventListener('keyup', timerFunction);
  function timerFunction() {
    clearTimeout(typingTimer);
    typingTimer = setTimeout(liveSearch, typeInterval);    
  };

  // clearing the input box
  searchInput.addEventListener('search', clearSearch);
  function clearSearch() {
    for (let i = 0; i < listCards.length; i++) {
      listCards[i].classList.remove('is-hidden');
    };    
  };
})();

//copied and tweaked from here: https://css-tricks.com/in-page-filtered-search-with-vanilla-javascript/