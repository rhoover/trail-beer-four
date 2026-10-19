(() => {
  'use strict';

  let backButton = document.querySelector('.back-button');

  // get rid of class on landing page
  window.addEventListener('pageshow', function(event) {
    if (event.persisted && history.state) {
      backButton.classList.remove('back-button-active');
    };
  }, {once: true});

  // history.length is always 1 or 2 when landing on site for first time
  // it will be 2 if landing on site for the first time from URL in a new tab
  // it will be 1 if site was landed upon for the first time from a link somewhere else
  if ((history.state == null && document.referrer == '') || history.length == 1) {
    history.replaceState({ historyLength: history.length, href: location.href, page: 'Landing Page' }, "foo");
    return;
  } else {
    backButton.classList.add('back-button-active');
  };

  backButton.onclick = function () {
    history.back();
  };

})();