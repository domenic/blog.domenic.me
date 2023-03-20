// Ideally this would all be doable declaratively, and maybe it is, but due to https://crbug.com/1425643 I can't really
// test it.

function main() {
  const supportsHover = window.matchMedia("(hover: hover)").matches;
  if (!supportsHover) {
    insertPointerDownPrefetchSpeculationRules();
  } else {
    setUpHoverPrerenderSpeculationRules();
  }
}

function insertPointerDownPrefetchSpeculationRules() {
  // "href_matches" is necessary to work around https://crbug.com/1425861.
  addSpeculationRules({
    prefetch: [
      {
        source: "document",
        where: { href_matches: { protocol: "https" } }
      }
    ]
  });
}

// How long to leave a prerendered page around for even if the user isn't hovering over a corresponding link.
const HOVER_TIMEOUT = 5_000;

class HoverSpeculationRulesManager {
  #linkMap = new WeakMap();

  addOrExtend(link) {
    const entry = this.#linkMap.get(link);
    if (entry) {
      clearTimeout(entry.timeout);
      entry.timeout = null;
      return;
    }

    const url = link.href;
    const speculationRules = addSpeculationRules({
      prerender: [
        { source: "list", urls: [url] }
      ]
    });

    this.#linkMap.set(link, {
      speculationRules,
      timeout: null
    });
  }

  startTimeout(link) {
    const entry = this.#linkMap.get(link);
    if (!entry) {
      return;
    }

    entry.timeout = setTimeout(() => {
      entry.speculationRules.remove();
      this.#linkMap.delete(link);
    }, HOVER_TIMEOUT);
  }
}

function setUpHoverPrerenderSpeculationRules() {
  const manager = new HoverSpeculationRulesManager();

  document.addEventListener("pointerover", (event) => {
    if (event.target.matches("a")) {
      manager.addOrExtend(event.target);
    }
  });
  document.addEventListener("pointerout", (event) => {
    if (event.target.matches("a")) {
      manager.startTimeout(event.target);
    }
  });
}

function addSpeculationRules(json) {
  const script = document.createElement("script");
  script.type = "speculationrules";
  script.textContent = JSON.stringify(json, undefined, 2);
  document.head.append(script);
  return script;
}

main();
