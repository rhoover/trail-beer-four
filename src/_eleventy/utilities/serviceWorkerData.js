
import fs from 'fs';
import path from 'path';

function getServiceWorkerData() {
  let foldersToInclude = [ 'css', 'fonts', 'js/packages', 'img/sprites', 'img/home'];
  
  // only html from root
  let filesToInclude = fs.readdirSync('dist').filter(function(file) {
    return path.extname(file) === '.html';
  });

  // get only the image in the header
  let headerImage = fs.readdirSync('dist/img/icns').filter(function(file) {
    return file === 'android-icon-48x48.png';
  });
  filesToInclude.push('/img/icns/' + headerImage[0]);

  // add webmanifest to array
  filesToInclude.push('/manifest.webmanifest');

  // add lonely home page trail image
  // filesToInclude.push('/img/trail.webp');

  // add me :)
  filesToInclude.push('/img/moosedog-logo.png');

  // go through each endpoint folder to extract each file with file-path to stuff into final array
  // this is the main stuff, consider it partial offline capable
  foldersToInclude.forEach((folder) => {
    let tempFolder = fs.readdirSync('dist/' + folder);
    tempFolder.forEach((file) => {
        filesToInclude.push('/' + folder + '/' + file);
    });
  });

  // write file containing array of files with their path
  fs.writeFileSync(
    'dist/service-worker-data.json',
    JSON.stringify(filesToInclude)
  )
};

export { getServiceWorkerData };