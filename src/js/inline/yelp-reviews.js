(() => {
  'use-strict'

  document.addEventListener('click', (event) => {

    let targetBrewer = event.target.parentElement.closest('.list-item-reviews');

    if (!targetBrewer) {return};
    let yelpDataTarget = targetBrewer.querySelector('.list-item-yelp');
    let spinner = targetBrewer.querySelector('#spinner');

    targetBrewer.classList.toggle('watching');

    if (!targetBrewer.classList.contains('watching')) {
      let reviews = yelpDataTarget.querySelectorAll('.list-item-yelp-card');
      reviews.forEach(el => {
        el.remove();
      });
      return;
    };

    let brewerPhone = targetBrewer.getAttribute('data-phone');

    function formatYelpPhone(rawPhone) {
      if (!rawPhone) return '';
      const digitsOnly = rawPhone.replace(/\D/g, '');
      if (digitsOnly.length === 10) return `+1${digitsOnly}`;
      if (digitsOnly.length === 11 && digitsOnly.startsWith('1')) return `+${digitsOnly}`;
      return digitsOnly.length > 0 ? `+${digitsOnly}` : '';
    };
    
    let brewerObject = {
      phone: formatYelpPhone(brewerPhone)
    };
    let jsonBrewer = JSON.stringify(brewerObject);
    console.log(jsonBrewer);
    

    getReviews(jsonBrewer, yelpDataTarget, spinner);
    
  }); // end listener

  function getReviews(jsonBrewer, yelpDataTarget, spinner) {

    spinner.classList.remove('hidden');

    fetch('https://vtbeertrail.com/server/yelp-reviews.php', {
      method: 'POST',
      body: jsonBrewer
    })
    .then(res => {      
      return res.json();
    })
    .then (res => {
      let yelpData = res.reviews;

      spinner.classList.add('hidden');
      
      // 404 response
      if (!yelpData) {
        let errorContent = `
          <div class="list-item-yelp-card">
            <p class="list-item-card-text">Sorry, ${res.error}</p>
          </div>
        `;
        yelpDataTarget.innerHTML += errorContent;
        return;
      };

      let yelpContent = "";

      yelpData.forEach((yelpItem) => {
        
        //if we're to show the review stars, must first assign a string to the number rating
        // yelp is now doing ratings like "3.25", so I'm just taking the low whole number
        let ratingNumber = yelpItem.rating;
        let ratingString = "";
        switch (true) {
          case ratingNumber >= 5:
            ratingString = "five";    
            break;
          case ratingNumber >= 4:
            ratingString = "four";
            break;
          case ratingNumber >= 3:
            ratingString = "three";
            break;
          case ratingNumber >= 2:
            ratingString = "two";
            break;
          case ratingNumber >= 1:
            ratingString = "one";
            break;
          case ratingNumber >= 0:
            ratingString = "zero";
            break;
        };

        yelpContent = `
          <div class="list-item-yelp-card">
            <span class="list-item-yelp-card-rating ${ratingString}"></span>
            <p class="list-item-yelp-card-name">${yelpItem.user.name}:</p>
            <p class="list-item-yelp-card-text">${yelpItem.text}</p>
          </div>
        `;

        yelpDataTarget.innerHTML += yelpContent;
      }); // end forEach
    });
  };
})();