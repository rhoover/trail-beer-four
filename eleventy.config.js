// Plugins
import eleventySass from "eleventy-sass";
import pluginRev from "eleventy-plugin-rev";
import { minify } from "terser";

// Filters
import { jsonToString } from "./src/_eleventy/filters/artisan-to-string.js";
import { dateFormatter } from "./src/_eleventy/filters/date-format.js";

// Shortcodes
 import { createData } from "./src/_eleventy/shortcodes/structured-data.js";

// Utilities
import { sassOptions } from "./src/_eleventy/utilities/sassCompileOptions.js";
import { htmlMinifier } from "./src/_eleventy/utilities/minify-html.js";
import { getServiceWorkerData } from "./src/_eleventy/utilities/serviceWorkerData.js";

import dotenv from 'dotenv';
import path from 'path';
dotenv.config({ path: path.resolve(process.cwd(), 'googlemaps.env.local') });

// Main Config
export default async function(eleventyConfig) {

  ////////////////////////////////////////////////////
  // Watch Javascript File Changes, and Minimize
  ////////////////////////////////////////////////////

  // folder to keep an eye on
  eleventyConfig.addWatchTarget("./src/js/inline/");
  // let'er rip
  eleventyConfig.addFilter("jsmin", async function (code) {
    let minified = await minify(code);
    return minified.code;
	});

  ////////////////////////////////////////////////////
  // Pass Throughs
  ////////////////////////////////////////////////////
  ['src/img', 'src/server', {'src/js/packages': 'js/packages/'}, {"src/fonts": "fonts"}].forEach(filesFromPath =>
    eleventyConfig.addPassthroughCopy(filesFromPath)
  );
  eleventyConfig.addPassthroughCopy('src/_data/brewers.json');
  eleventyConfig.addPassthroughCopy('favicon.ico');
  eleventyConfig.addPassthroughCopy('robots.txt');
  eleventyConfig.addPassthroughCopy('manifest.webmanifest');
  eleventyConfig.addPassthroughCopy('beertrail-service-worker-min.js');

  ////////////////////////////////////////////////////
  // Plugins
  ////////////////////////////////////////////////////

  // let eleventy handle compiling sass
  eleventyConfig.addPlugin(eleventySass, sassOptions);
  // revision the css filename
  eleventyConfig.addPlugin(pluginRev);

  ////////////////////////////////////////////////////
  // Filters
  ////////////////////////////////////////////////////

  // artisan object for detail page
  eleventyConfig.addFilter("stringFromArtisanObject", jsonToString);

  // date formatter...duh
  eleventyConfig.addFilter("dateFormat", dateFormatter);

  ////////////////////////////////////////////////////
  // Shortcodes
  ////////////////////////////////////////////////////

  // json-ld data creation
  eleventyConfig.addShortcode("schemaDataShortCode", createData);

  ////////////////////////////////////////////////////
  // Utilities
  ////////////////////////////////////////////////////

  // minify html for production build
  eleventyConfig.addTransform("htmlmin", htmlMinifier);

  //create json file for service worker
  eleventyConfig.on("eleventy.after", getServiceWorkerData);

}; // end main config


// Build Config
export const config = {
  dir: {
    input: "src",
    output: "dist"
  },
  htmlTemplateEngine: "njk",
  templateFormats: ["html", "njk"]
};