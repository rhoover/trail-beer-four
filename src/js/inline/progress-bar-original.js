(() => {
 'use-strict' 
  
  const trailButtonRow = document.querySelector('.trail-tabs-row');
  const communityButtonRow = document.querySelector('.tabs-row');
  const scrollButton = document.querySelector('.scroller');
  let counter = 0;

  // Get the current height of the viewport
  const viewportHeight = window.innerHeight;

  function checkMainHeight() {
    
    const mainElement = document.querySelector('main');
    const bodyElement = document.body;

    // Get the full layout height of the main tag (including padding and borders)
    requestAnimationFrame(() => {

      const mainHeight = mainElement.offsetHeight;
      console.log('main:', mainHeight, 'window:', viewportHeight);

      // Check if the element is less than the viewport
      if (mainHeight < viewportHeight) {

        bodyElement.classList.add('dynamic-pseudo');

        // 2. Create a style block
        const style = document.createElement("style");
        style.setAttribute('progress', "active");
        style.textContent = `
          .dynamic-pseudo::after {
          content: "";
          display: none;
          }
        `;

        // 3. Append the style block to the document head
        document.head.appendChild(style);

        // deal with scroller
        // if (counter > 0) {
          
        //   if (scrollButton.style.display) {
        //     // scrollButton.removeAttribute('style');
        //     console.log('yep', counter);
            
        //   };
        // };
      } else { // then it is longer than the viewport
        if (bodyElement.classList.contains('dynamic-pseudo')) {
          bodyElement.classList.remove('dynamic-pseudo');
          bodyElement.removeAttribute('class');
          let styleBlock = document.querySelector('[progress]');
          styleBlock.remove();
        };
        // if (scrollButton.style.display != "") {
        //   scrollButton.removeAttribute('style');
        // };
      }; // end else
    }); // end requestanimationframe
  }; // end checkMainHeight

  // this makes sure no error occurs on pages that are not trail
  trailButtonRow?.addEventListener('click', checkMainHeight);
  communityButtonRow?.addEventListener('click', checkMainHeight);
  // if (communityButtonRow) {
  //   document.addEventListener('data-rendered', (event) => {
  //     counter++;
  //     checkMainHeight();
  //   });  
  // };
  // communityButtonRow?.addEventListener('click', checkMainHeight);
  // if (trailButtonRow) {
  //   document.addEventListener('toggle-panels', (event) => {
  //     counter++;
  //     console.log(counter);
      
  //     checkMainHeight();
  //   });   
  // };
  // this is for pages that are not trail or community
  if (!trailButtonRow || !communityButtonRow) {
    window.addEventListener('DOMContentLoaded', checkMainHeight);
  };
})();