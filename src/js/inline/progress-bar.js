(() => {
 'use-strict' 
  
  const trailButtonRow = document.querySelector('.trail-tabs-row');
  const communityButtonRow = document.querySelector('.tabs-row');
  const scrollButton = document.querySelector('.scroller');
  const viewportHeight = window.innerHeight;
  const bodyElement = document.body;
  const mainElement = document.querySelector('main');

  function initialState() {
    let mainHeight = mainElement.offsetHeight;
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
    };
  };
  initialState();

  const observer = new ResizeObserver((entries) => {
    for (let entry of entries) {
      // Get the fresh height after the other script modified the DOM
      const newHeight = entry.contentRect.height; 
      
      console.log('Panel container height changed to:', newHeight);
      // Your logic here
      if (newHeight < viewportHeight) {
        // dealing with progress bar
        bodyElement.classList.add('dynamic-pseudo');
        const style = document.createElement("style");
        style.setAttribute('progress', "active");
        style.textContent = `
          .dynamic-pseudo::after {
          content: "";
          display: none;
          }
        `;
        document.head.appendChild(style);

        // dealing with  scroll button
        scrollButton.style.display = 'none';
      } else { // it's taller
        // dealing with progress bar
        if (bodyElement.classList.contains('dynamic-pseudo')) {
          bodyElement.classList.remove('dynamic-pseudo');
          bodyElement.removeAttribute('class');
          document.querySelector('[progress]').remove();
        }; // end inner if
        // dealing with scroll button
        if (scrollButton.hasAttribute('style')) {
          scrollButton.removeAttribute('style');
        }; // end inner if
      }; // end else
    }; // end for
  });
  if (trailButtonRow || communityButtonRow) {
    document.addEventListener('dataRendered', () => {
      observer.observe(mainElement);
    }, {once:true});
  };
})();