'use strict';
const pluginRSS = require('@11ty/eleventy-plugin-rss');
const pluginSyntaxHighlight = require('@11ty/eleventy-plugin-syntaxhighlight');
const markdownIt = require('markdown-it');
const adjustHeadingLevel = require('./adjust-heading-level.js');
const metadata = require('./src/_data/metadata.json');

module.exports = eleventyConfig => {
  eleventyConfig.addPlugin(pluginRSS);
  eleventyConfig.addPlugin(pluginSyntaxHighlight);

  eleventyConfig.addPassthroughCopy('src/css');
  eleventyConfig.addPassthroughCopy('src/images');
  eleventyConfig.addPassthroughCopy({ 'node_modules/prismjs/themes/prism.css': 'css/prism.css' });

  eleventyConfig.setLibrary(
    'md',
    markdownIt({
      html: true,
      typographer: true
    })
    .use(adjustHeadingLevel, { firstLevel: 2 })
  );

  addFilters(eleventyConfig);

  eleventyConfig.addCollection('posts', collection => {
    return collection.getFilteredByGlob('src/posts/*.md');
  });

  return {
    templateFormats: [
      'md',
      'njk',
      'html'
    ],

    markdownTemplateEngine: 'liquid',
    htmlTemplateEngine: 'njk',
    dataTemplateEngine: 'njk',

    passthroughFileCopy: true,
    dir: {
      input: 'src',
      includes: '_includes',
      data: '_data',
      output: 'dist',
    }
  };
};

function addFilters(eleventyConfig) {
  const readableDTF = new Intl.DateTimeFormat('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    timeZone: 'UTC'
  });
  eleventyConfig.addFilter('readableDate', dateObj => {
    return readableDTF.format(dateObj);
  });

  const archiveDTF = new Intl.DateTimeFormat('en-US', { month: 'short', timeZone: 'UTC' });
  eleventyConfig.addFilter('archiveDateHTML', dateObj => {
    return `<span class="month">${archiveDTF.format(dateObj)}</span> ` +
           `<span class="day">${dateObj.getUTCDate().toString().padStart(2, '0')}</span> ` +
           `<span class="year">${dateObj.getUTCFullYear()}</span>`;
  });

  eleventyConfig.addFilter('getYear', dateObj => {
    return dateObj.getUTCFullYear();
  });

  eleventyConfig.addFilter('toUTCString', dateString => {
    return (new Date(dateString)).toUTCString();
  });

  eleventyConfig.addFilter('slugToPermalink', string => {
    return string.replace(/^\/posts\/\d{4}-\d{2}-\d{2}-/, "") + "/";
  });

  eleventyConfig.addFilter('absoluteURL', relativeURL => {
    return (new URL(relativeURL, metadata.url)).href;
  });
}
