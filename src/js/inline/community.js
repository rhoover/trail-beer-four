(() => {
 'use-strict'

  let mainElement = document.querySelector('main');
  let allButtons = mainElement.querySelectorAll('.tabs-item');
  let allPanels = mainElement.querySelectorAll('.panel');

  // Wait for the DOM to be ready
  // this acts as an orchestrator between components
  // it receives its data from the buttons row component
  document.addEventListener('DOMContentLoaded', () => {
    // this event has been dispatched by the button row component
    mainElement.addEventListener('button-selected', (event) => {
      // build formdata to be sent to server for fetching weather and yelp data
      let dataForAPI = new FormData();
      // detail is a key in the custom event that gets dispatched when clicking on a button
      // detail's value is an object that contains the lat and lng data
      dataForAPI.append('latitude', event.detail.latitude);
      dataForAPI.append('longitude', event.detail.longitude);

      // deal with button UI
      if (event.detail.buttonClicked.matches('.tabs-item-active')) {
        return;
      } else {
        allButtons.forEach((button) => {
          if (button.classList.contains('tabs-item-active')) {
            button.classList.remove('tabs-item-active');
          };
        }); // end forEach
        // then add new active class to clicked tab
        event.detail.buttonClicked.classList.add('tabs-item-active');
      }; // end if-else

      // panels both ui and behavior
      allPanels.forEach(panel => {
        // UI
        if (panel.classList.contains('panel-active')) {
          panel.classList.remove('panel-active');
        };

        if (panel.getAttribute('target-panel') === event.detail.sourceData) {
          panel.classList.add('panel-active');
          //send data to approppriate panel component
          if (typeof panel.update === 'function') {
            switch (event.detail.sourceData) {
              case 'weather':
                panel.update(dataForAPI);
              break;
              case 'dining':
                dataForAPI.append('term', 'restaurants');
                panel.update(dataForAPI);
              break;
              case 'shopping':
                dataForAPI.append('term', 'shopping');
                panel.update(dataForAPI);
              break;
              default:
            }; //end switch
          }; // end inner if
        }; // end outer if
      }); // end forEach panel
    }); // end listener
  });

  customElements.define('buttons-row', class extends HTMLElement {
  
    connectedCallback() {
      this.addEventListener('click', (event) => {

        // create data to be dispatched
        let targetPanelName = event.target.getAttribute('source-button');
        let lat = event.target.closest('.tabs-row').getAttribute('brewer-latitude');
        let lon = event.target.closest('.tabs-row').getAttribute('brewer-longitude');

        let dataToSend = {
          sourceData: targetPanelName,
          latitude: lat,
          longitude: lon,
          buttonClicked: event.target
        };

        // send
        this.dispatchEvent(new CustomEvent('button-selected', {
          detail: dataToSend,
          bubbles: true,
          composed: true
        }));
      });
    }; // end connectedCallback()
  
  }); // end customElements.define()

  customElements.define('dining-panel', class extends HTMLElement {
    update(incomingData) {
      this.diniingInit(incomingData);
    };
    
    diniingInit(dataForAPI) {
      // fetch Yelp data
      // it wasn't until I *stopped* using the headers{} option did the fetch() start to work
      fetch('https://vtbeertrail.com/server/yelp.php', {
        method: 'POST',
        body: dataForAPI
      })
      .then(res => {
        return res.text();
      })
      .then(res => {
  
        let diningResults = JSON.parse(res).businesses;

        this.diningRenderPanel(diningResults);
      });
    }; // end yelpInit

    diningRenderPanel(diningResults) {

      // initialize
      let diningContent = "";

      // the response is a single array, each object is a business to display, thus the loop encompassing everything
      diningResults.forEach((diningItem) => {

        //if we're to show the review stars, must first assign a string to the number rating
        // yelp is now doing ratings like "3.25", so I'm just taking the low whole number
        let ratingNumber = diningItem.rating;
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

        // yelp render from data build
        diningContent = `
          <div class="panel-yelpcard">
            <img src="${diningItem.image_url}" class="panel-yelpcard-image">
            <div class="panel-yelpcard-meta">
              <p class="panel-yelpcard-meta-name">${diningItem.name}</p>
              <p class="panel-yelpcard-meta-address">${diningItem.location.address1}</p>
              <p class="panel-yelpcard-meta-location">${diningItem.location.city}, ${diningItem.location.state}  ${diningItem.location.zip_code}</p>
            </div>
            <div class="panel-yelpcard-yelp">
              <span class="panel-yelpcard-yelp-stars ${ratingString}"></span>
              <p class="panel-yelpcard-yelp-reviews">Reviews: ${diningItem.review_count}</p>
              <a href="${diningItem.phone}" class="panel-yelpcard-yelp-phone">${diningItem.display_phone}</a>
                <a class="panel-yelpcard-yelp-url" href="" target="_blank" rel="noreferrer noopener">Explore On <img src="/img/yelp_fullcolor.png" alt="Yelp Dot Com Page">
              </a>
            </div>
          </div>
        `;

        // yelpDataTarget.innerHTML += shoppingContent;
        this.innerHTML += diningContent;
      }); // end .forEach
      const renderEvent = new CustomEvent('dataRendered');
      document.dispatchEvent(renderEvent);
    }; // end yelpRenderPanel
  }); // end customElements.define()

  customElements.define('shopping-panel', class extends HTMLElement {
    update(incomingData) {
      this.shoppingInit(incomingData);    
    };

    shoppingInit(dataForAPI) {
      // fetch Yelp data
      // it wasn't until I *stopped* using the headers{} option did the fetch() start to work
      fetch('https://vtbeertrail.com/server/yelp.php', {
        method: 'POST',
        body: dataForAPI
      })
      .then(res => {
        return res.text();
      })
      .then(res => {
  
        let shoppingResults = JSON.parse(res).businesses;

        this.shoppingRenderPanel(shoppingResults);
      });
    }; // end init

    shoppingRenderPanel(shoppingResults) {
      // initialize
      let shoppingContent = "";

      // the response is a single array, each object is a business to display, thus the loop encompassing everything
      shoppingResults.forEach((shoppingItem) => {

        //if we're to show the review stars, must first assign a string to the number rating
        // yelp is now doing ratings like "3.25", so I'm just taking the low whole number
        let ratingNumber = shoppingItem.rating;
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

        // yelp render from data build
        shoppingContent = `
          <div class="panel-yelpcard">
            <img src="${shoppingItem.image_url}" class="panel-yelpcard-image">
            <div class="panel-yelpcard-meta">
              <p class="panel-yelpcard-meta-name">${shoppingItem.name}</p>
              <p class="panel-yelpcard-meta-address">${shoppingItem.location.address1}</p>
              <p class="panel-yelpcard-meta-location">${shoppingItem.location.city}, ${shoppingItem.location.state}  ${shoppingItem.location.zip_code}</p>
            </div>
            <div class="panel-yelpcard-yelp">
              <span class="panel-yelpcard-yelp-stars ${ratingString}"></span>
              <p class="panel-yelpcard-yelp-reviews">Reviews: ${shoppingItem.review_count}</p>
              <a href="${shoppingItem.phone}" class="panel-yelpcard-yelp-phone">${shoppingItem.display_phone}</a>
                <a class="panel-yelpcard-yelp-url" href="" target="_blank" rel="noreferrer noopener">Explore On <img src="/img/yelp_fullcolor.png" alt="Yelp Dot Com Page">
              </a>
            </div>
          </div>
        `;

        this.innerHTML += shoppingContent;
      }); // end .forEach
      const renderEvent = new CustomEvent('dataRendered');
      document.dispatchEvent(renderEvent);
    }; // end shopping render panel
  }); // end customElements.define()

  customElements.define('weather-panel', class extends HTMLElement {
   update(incomingData) {
    this.weatherInit(incomingData);
   }; // end update
   
    weatherInit(incomingData) {
      // fetch OpenWeather data
      // it wasn't until I *stopped* using the headers{} option did the fetch() start to work
      fetch('https://vtbeertrail.com/server/openweather.php', {
        method: 'POST',
        body: incomingData
      })
      .then(res => {
        return res.text();
      })
      .then(res => {
        let weatherResults = JSON.parse(res);
        this.weatherPanelRender(weatherResults);
      }); // end .then(res)
    }; // end weatherInit

    weatherPanelRender(weatherResults) {

      let currentContentTarget = this.querySelector('.panel-weather-current');
      let fivedayContentTarget = this.querySelector('.panel-weather-fiveday');
      let currentContent = "";
      let fivedayContent = "";

      //get next five days data, all of it
      let daily = weatherResults.daily.slice(1, 6);

      //initialize days of week, as .dt returns an integer
      let dayOfWeek = {0:"Sun",1:"Mon",2:"Tue",3:"Wed",4:"Thu",5: "Fri",6: "Sat"};

      //initialize five-day forecast array
      let fiveDayForecast = [];

      // let'er rip to create the five-day forecast array
      for (let i = 0; i < daily.length; i++) {
        let dailyWeatherObj = {};
        let dayNum = new Date(daily[i].dt * 1000).getDay();
        dailyWeatherObj['minTemp'] = Math.round(daily[i].temp.min);
        dailyWeatherObj['maxTemp'] = Math.round(daily[i].temp.max);
        dailyWeatherObj['icon'] = daily[i].weather[0].icon;
        dailyWeatherObj['desc'] = daily[i].weather[0].main;
        dailyWeatherObj['day'] = dayOfWeek[dayNum];
        fiveDayForecast.push(dailyWeatherObj);
      };

      // current weather render from data build
      currentContent = `
        <h5 class="panel-weather-current-header">Current Weather:</h5>
        <img src="/img/openWeather/${weatherResults.current.weather[0].icon}.png" width="50" height="50">
        <p class="desc">${weatherResults.current.weather[0].description.replace(/\b\w/g, (c) => c.toUpperCase())}</p>
        <p class="current">${Math.round(weatherResults.daily[0].temp.day) + '\u00B0'}</p>
        <p class="min">Min. Temp:<br />${Math.round(weatherResults.daily[0].temp.min) + '\u00B0'}</p>
        <p class="max">Max. Temp:<br />${Math.round(weatherResults.daily[0].temp.max) + '\u00B0'}</p>
        <p class="precip">Precip Chance:<br />${weatherResults.daily[0].pop * 100 + '\u0025'}</p>
      `; // end current content
      currentContentTarget.innerHTML = currentContent;

      // because the five day forcast is an array, to get the data into a template literal
      // I must run a function for each div in the card: days, icons, descriptions, temps
      // each output is called in the literal
      function fiveDays() {
        let days = "";
        fiveDayForecast.forEach((i) => {
          days += `<p>${i.day}</p>`;
        });
        return days;
      };
      function fiveIcons() {
        let icons = "";
        fiveDayForecast.forEach((i) => {
          icons += `<img src="/img/openWeather/${i.icon}.png" width="50" height="50">`;
        });
        return icons;
      };
      function fiveDescriptions() {
        let desc = "";
        fiveDayForecast.forEach((i) => {
          desc += `<p>${i.desc}</p>`;
        });
        return desc;
      };
      function fiveTemps() {
        let temps = "";
        fiveDayForecast.forEach((i) => {
          temps += `<p>Low: ${i.minTemp + '\u00B0'} Hi: ${i.maxTemp  + '\u00B0'}</p>`;
        });
        return temps;
      };

      // five-day forecast weather display from data build
      // super simple as all the legwork has been done just above
      fivedayContent = `
        <h5 class="panel-weather-fiveday-header">5 Day Forecast</h5>
        <div class="panel-weather-fiveday-days">${fiveDays()}</div>
        <div class="panel-weather-fiveday-icons">${fiveIcons()}</div>
        <div class="panel-weather-fiveday-desc">${fiveDescriptions()}</div>
        <div class="panel-weather-fiveday-temps">${fiveTemps()}</div>
      `;
      fivedayContentTarget.innerHTML = fivedayContent;
      const renderEvent = new CustomEvent('dataRendered');
      document.dispatchEvent(renderEvent);
    }; // end weather panel render

  }); // end customElements.define()

})();