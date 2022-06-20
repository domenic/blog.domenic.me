"use strict";

// Based on https://gist.github.com/rodneyrehm/4feec9af8a8635f7de7cb1754f146a39

module.exports = (md, { firstLevel }) => {
  const levelOffset = firstLevel - 1;

  md.core.ruler.push("adjust-heading-levels", ({ tokens }) => {
    for (let i = 0; i < tokens.length; ++i) {
      if (tokens[i].type !== "heading_close") {
        continue;
      }

      const headingOpen = tokens[i - 2];
      const headingClose = tokens[i];

      const currentLevel = getHeadingLevel(headingOpen.tag);
      const newTag = "h" + Math.min(currentLevel + levelOffset, 6);

      headingOpen.tag = headingClose.tag = newTag;
    }
  });
}

function getHeadingLevel(tag) {
  const [, currentLevelAsString] = /^h([1-6])$/.exec(tag);
  return Number(currentLevelAsString);
}
