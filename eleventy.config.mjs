'use strict';
import { feedPlugin } from '@11ty/eleventy-plugin-rss';
import pluginSyntaxHighlight from '@11ty/eleventy-plugin-syntaxhighlight';
import markdownIt from 'markdown-it';
import markdownItAnchor from 'markdown-it-anchor';
import adjustHeadingLevel from './adjust-heading-level.mjs';
import metadata from './src/_data/metadata.json' with { type: 'json' };

export default async (eleventyConfig) => {
  eleventyConfig.addPlugin(feedPlugin, {
    type: 'atom',
    outputPath: 'feed.xml',
    collection: {
      name: 'posts',
      limit: 10
    },
    metadata: transformMetadataForFeedPlugin(metadata)
  });

  eleventyConfig.addPlugin(pluginSyntaxHighlight);

  eleventyConfig.addPassthroughCopy('src/css');
  eleventyConfig.addPassthroughCopy('src/js');
  eleventyConfig.addPassthroughCopy('src/images');
  eleventyConfig.addPassthroughCopy({ 'node_modules/prismjs/themes/prism.css': 'css/prism.css' });

  eleventyConfig.setLibrary(
    'md',
    markdownIt({
      html: true,
      typographer: true
    })
    .use(adjustHeadingLevel, { firstLevel: 2 })
    .use(markdownItAnchor, {
      tabIndex: false
    })
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

  eleventyConfig.addFilter('getYear', dateObj => {
    return dateObj.getUTCFullYear();
  });

  eleventyConfig.addFilter('slugToPermalink', string => {
    return string.replace(/^\/posts\/\d{4}-\d{2}-\d{2}-/, '') + '/';
  });

  eleventyConfig.addFilter('exclude', (array, arrayToExclude) => {
    return array.filter(item => !arrayToExclude.includes(item));
  });
}

function transformMetadataForFeedPlugin(metadata) {
  return { ...metadata, subtitle: metadata.description };
}
