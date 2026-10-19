import fs from 'fs';

// declare all characters
const characters ='ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz';
let result = ' ';
const charactersLength = characters.length;
for ( let i = 0; i < 7; i++ ) {
    result += characters.charAt(Math.floor(Math.random() * charactersLength));
};

result.toString();
let resultOne = result.trimStart();

// let newCacheName = 'artisansCache-' + resultOne;
let newCacheName = ` 'beertrailCache-${resultOne}' `;
// 

function dealWithContent(callback) {
  fs.readFile('src/_eleventy/utilities/service-worker-base.js', 'utf8', (err, data) => { 
    if(err) { 
      throw err; 
    } else {
      callback(null, data);
    };
  });
};

dealWithContent((err, content) => {

  let newFile = `(() => {
    "use strict";

    let cacheName = ${newCacheName};

    ${content};

    })();
    `;
  
  fs.writeFile('./beertrail-service-worker.js', newFile, (err) => {
    if (err) {
      console.log('error writing:', err);
    } else {
      console.log('success writing');
    }
  });
});
