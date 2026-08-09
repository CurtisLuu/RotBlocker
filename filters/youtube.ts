/**
 * YouTube filter manifest.
 *
 * Same idea as Instagram: the regular site is worth keeping, one surface
 * isn't. Here that surface is Shorts — the tab, the shelves it gets seeded
 * into, the entries in search, and the swipe feed at /shorts.
 *
 * Selector notes for whoever repairs this after the next redesign:
 *
 * - The WebView loads m.youtube.com, so the mobile custom elements (`ytm-…`)
 *   are the ones that matter. The desktop ones (`ytd-…`) are kept as a cheap
 *   fallback in case a link lands on the full site.
 * - YouTube's element names are its own component names — they churn, but far
 *   slower than class names, and they say what they are.
 * - `tab-identifier="FEshorts"` and `href^="/shorts"` are the two hooks that
 *   have outlived everything else; when a selector below stops matching,
 *   start from those.
 * - Every `:has()` selector sits in its own rule. An engine that doesn't know
 *   `:has()` throws out the whole rule it appears in, and grouping it with a
 *   plain selector would take that one down too.
 */

import { buildFilterScript } from "./common";

export type YouTubeFilterOptions = {
  hideShortsTab: boolean;
  hideShortsShelf: boolean;
  hideShortsInSearch: boolean;
  blockShortsNavigation: boolean;
};

export const DEFAULT_YOUTUBE_FILTERS: YouTubeFilterOptions = {
  hideShortsTab: true,
  hideShortsShelf: true,
  hideShortsInSearch: true,
  blockShortsNavigation: true,
};

export const YOUTUBE_URL = "https://m.youtube.com/";

/**
 * The WebView refuses the Shorts feed outright. A single Shorts video is let
 * through on purpose — the injected script rewrites it to /watch before the
 * page renders, so a link someone sent still plays.
 */
export function isYouTubeShortsFeedUrl(url: string): boolean {
  try {
    const parsed = new URL(url);
    const host = parsed.hostname;
    // Exact host or a subdomain of it — "notyoutube.com" must not match.
    if (host !== "youtube.com" && !host.endsWith(".youtube.com")) return false;
    return parsed.pathname === "/shorts" || parsed.pathname === "/shorts/";
  } catch {
    return false;
  }
}

/** Pulls the video id out of any string containing `/shorts/<id>`. */
const SHORTS_ID_SOURCE = `
  function shortsId(value) {
    var at = value.indexOf('/shorts/');
    if (at < 0) return '';
    var rest = value.slice(at + 8);
    var cut = rest.length;
    var stops = ['/', '?', '&', '#'];
    for (var s = 0; s < stops.length; s++) {
      var idx = rest.indexOf(stops[s]);
      if (idx >= 0 && idx < cut) cut = idx;
    }
    return rest.slice(0, cut);
  }
`;

/** Shelves: a strip of Shorts dropped into the home feed, search, or a channel. */
const SHELF_SELECTOR =
  "ytm-reel-shelf-renderer, ytd-reel-shelf-renderer, ytd-rich-shelf-renderer[is-shorts]";

/** The section wrapper around a shelf — hiding the shelf alone leaves its gap. */
const SECTION_SELECTOR = "ytm-rich-section-renderer, ytd-rich-section-renderer";

/** One result / grid cell, whatever list it belongs to. */
const ITEM_SELECTOR = [
  "ytm-shorts-lockup-view-model",
  "ytm-shorts-lockup-view-model-v2",
  "ytm-video-with-context-renderer",
  "ytm-compact-video-renderer",
  "ytm-media-item",
  "ytm-rich-item-renderer",
  "ytd-video-renderer",
  "ytd-rich-item-renderer",
  "li",
].join(", ");

/** Navigation entries: the mobile bottom bar and the desktop sidebar. */
const NAV_SELECTOR =
  "ytm-pivot-bar-item-renderer, ytd-guide-entry-renderer, ytd-mini-guide-entry-renderer";

/** Builds injected JS that runs at document start and on DOM mutations. */
export function buildYouTubeFilterScript(
  options: YouTubeFilterOptions
): string {
  const css: string[] = [];

  if (options.hideShortsTab) {
    css.push(
      // Bottom bar entry on mobile. FEshorts is YouTube's own feed id.
      'ytm-pivot-bar-item-renderer[tab-identifier="FEshorts"] { display: none !important; }',
      // Older mobile bar, where the entry is the link itself.
      '.pivot-bar-item-tab[href^="/shorts"] { display: none !important; }',
      // Desktop collapsed sidebar; labelled for screen readers.
      'ytd-mini-guide-entry-renderer[aria-label="Shorts"] { display: none !important; }',
      // Newer bars wrap the link in a component with no stable attribute.
      'ytm-pivot-bar-item-renderer:has(a[href^="/shorts"]) { display: none !important; }',
      'ytd-guide-entry-renderer:has(a[title="Shorts"]) { display: none !important; }'
    );
  }
  if (options.hideShortsShelf) {
    css.push(
      // The shelf component itself, mobile and desktop.
      "ytm-reel-shelf-renderer, ytd-reel-shelf-renderer { display: none !important; }",
      "ytd-rich-shelf-renderer[is-shorts] { display: none !important; }",
      // Home feed section holding a shelf of Shorts tiles.
      "ytm-rich-section-renderer:has(ytm-shorts-lockup-view-model) { display: none !important; }",
      // The grid variant YouTube switched some surfaces to.
      'grid-shelf-view-model:has(a[href^="/shorts"]) { display: none !important; }'
    );
  }
  if (options.hideShortsInSearch) {
    css.push(
      // A single Short listed among normal results.
      "ytm-shorts-lockup-view-model, ytm-shorts-lockup-view-model-v2 { display: none !important; }",
      'ytm-video-with-context-renderer:has(a[href^="/shorts"]) { display: none !important; }',
      'ytd-video-renderer:has(a[href^="/shorts"]) { display: none !important; }'
    );
  }

  return buildFilterScript({
    installFlag: "__rotblockerYouTubeInstalled",
    styleId: "rotblocker-youtube-style",
    options: options as unknown as Record<string, boolean>,
    css,
    // The JS pass does what CSS can't: walk up from a Shorts link to the row,
    // cell, or section that should go with it. It also covers engines without
    // `:has()`, so the toggles behave the same on an older WebView.
    extraApply: `function() {
      function hideNode(node) {
        if (!node || node.__rotblockerHidden) return;
        node.__rotblockerHidden = true;
        node.style.setProperty('display', 'none', 'important');
      }
      var SHELF = ${JSON.stringify(SHELF_SELECTOR)};
      var SECTION = ${JSON.stringify(SECTION_SELECTOR)};
      var ITEM = ${JSON.stringify(ITEM_SELECTOR)};
      var NAV = ${JSON.stringify(NAV_SELECTOR)};

      if (opts.hideShortsShelf) {
        var shelves = document.querySelectorAll(SHELF);
        for (var i = 0; i < shelves.length; i++) {
          hideNode(shelves[i].closest(SECTION) || shelves[i]);
        }
        // Shelves whose only stable marker is the header YouTube labels
        // "Shorts" — the renderer name moves, the label rarely does.
        var labelled = document.querySelectorAll('[aria-label="Shorts"], [title="Shorts"]');
        for (var l = 0; l < labelled.length; l++) {
          var section = labelled[l].closest(SHELF) || labelled[l].closest(SECTION);
          if (section) hideNode(section);
        }
      }

      if (opts.hideShortsInSearch) {
        var links = document.querySelectorAll('a[href^="/shorts"]');
        for (var j = 0; j < links.length; j++) {
          var link = links[j];
          // The nav entry and the shelves have their own toggles; leaving
          // them to those keeps each switch meaning one thing.
          if (link.closest(NAV) || link.closest(SHELF)) continue;
          hideNode(link.closest(ITEM) || link);
        }
      }

      if (opts.hideShortsTab) {
        var navs = document.querySelectorAll(NAV);
        for (var k = 0; k < navs.length; k++) {
          var nav = navs[k];
          if (
            nav.getAttribute('tab-identifier') === 'FEshorts' ||
            nav.querySelector('a[href^="/shorts"]') ||
            (nav.textContent || '').trim() === 'Shorts'
          ) {
            hideNode(nav);
          }
        }
      }
    }`,
    // /shorts/<id> is an ordinary video wearing a different player. Sending it
    // to /watch keeps a link someone shared working, and drops the endless
    // swipe feed, which is the part that's hard to put down. Bare /shorts is
    // that feed, so it goes home.
    redirectTarget: `function(path) {
      ${SHORTS_ID_SOURCE}
      if (!opts.blockShortsNavigation) return null;
      if (path.indexOf('/shorts') !== 0) return null;
      var id = shortsId(path);
      return id ? '/watch?v=' + id : '/';
    }`,
    interceptSelector: 'a[href*="/shorts"]',
    onInterceptedLink: `function(link, e) {
      ${SHORTS_ID_SOURCE}
      if (!opts.blockShortsNavigation) return;
      e.preventDefault();
      e.stopPropagation();
      var id = shortsId(link.getAttribute('href') || '');
      location.assign(id ? '/watch?v=' + id : '/');
    }`,
  });
}
