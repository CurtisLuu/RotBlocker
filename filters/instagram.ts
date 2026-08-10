/**
 * Instagram filter manifest.
 * Prefer href / aria / role selectors — Meta rotates class names often.
 * PRs welcome when Instagram redesigns break these.
 *
 * The scaffolding (inline video, dark color-scheme, mutation observer, URL
 * guard) lives in `filters/common.ts`; only the selectors are here.
 */

import { buildFilterScript } from "./common";

export type InstagramFilterOptions = {
  hideReelsTab: boolean;
  hideReelsInFeed: boolean;
  hideExplore: boolean;
  blockReelsNavigation: boolean;
  hidePosts: boolean;
  hideStories: boolean;
};

/**
 * Reels are off by default; posts and stories are not. The app's promise is
 * that the feed, stories and DMs keep working — so anything that takes those
 * away has to be something the user switches on themselves.
 */
export const DEFAULT_INSTAGRAM_FILTERS: InstagramFilterOptions = {
  hideReelsTab: true,
  hideReelsInFeed: true,
  hideExplore: false,
  blockReelsNavigation: true,
  hidePosts: false,
  hideStories: false,
};

/** True for the URLs `blockReelsNavigation` refuses at the WebView level. */
export function isInstagramReelsUrl(url: string): boolean {
  try {
    const parsed = new URL(url);
    return (
      parsed.hostname.includes("instagram.com") &&
      (parsed.pathname.startsWith("/reels") ||
        parsed.pathname.startsWith("/reel/"))
    );
  } catch {
    return false;
  }
}

/** Builds injected JS that runs at document start and on DOM mutations. */
export function buildInstagramFilterScript(
  options: InstagramFilterOptions
): string {
  const css: string[] = [];

  if (options.hideReelsTab) {
    css.push(
      // The tab itself, in the bottom bar and the profile grid header.
      'a[href="/reels/"], a[href^="/reels?"], a[href*="/reels/"] { display: none !important; }',
      'a[role="link"][href="/reels/"] { display: none !important; }',
      // The icon Instagram labels for screen readers — survives class churn.
      'svg[aria-label="Reels"] { display: none !important; }',
      'a[href="/reels/"] { pointer-events: none !important; }'
    );
  }
  if (options.hideExplore) {
    css.push(
      'a[href="/explore/"], a[href^="/explore?"] { display: none !important; }',
      'svg[aria-label="Explore"] { display: none !important; }'
    );
  }
  if (options.hideReelsInFeed) {
    // A Reel that has been slid into the main feed links to /reel/<id>.
    css.push('article a[href*="/reel/"] { display: none !important; }');
  }
  if (options.hidePosts) {
    css.push(
      // A feed post is an <article>. The home marker (see markHomeFeed in
      // extraApply) keeps this off permalinks, profiles and DMs, which use
      // the same element — hiding it there would blank a page the user
      // deliberately opened.
      'html[data-pleasefocus-home] main article { display: none !important; }'
    );
  }
  if (options.hideStories) {
    css.push(
      // The carousel above the first post is a row of links to
      // /stories/<username>/. Hiding the links empties it; collapseStoryRail
      // removes the strip they leave behind. Same home-only scoping, so
      // opening a story from a DM or a profile still works.
      'html[data-pleasefocus-home] main a[href^="/stories/"] { display: none !important; }',
      // The tray's own "add to story" entry, which is a button, not a link.
      'html[data-pleasefocus-home] main [aria-label="Add to story"] { display: none !important; }'
    );
  }

  return buildFilterScript({
    installFlag: "__pleasefocusInstalled",
    styleId: "pleasefocus-instagram-style",
    options: options as unknown as Record<string, boolean>,
    css,
    // Three passes that CSS alone can't do:
    //  - markHomeFeed  : a stylesheet can't read the URL, so the home-only
    //                    scoping for posts/stories is an attribute set here.
    //  - reel articles : CSS hides the link but not the post around it, so
    //                    walk up to the <article> from the badge or the link.
    //  - story rail    : the emptied carousel keeps its height; collapse it.
    // Order matters only for the rail, which reads the home marker.
    extraApply: `function() {
      var RAIL_FLAG = 'data-pleasefocus-rail';

      // Posts and stories are hidden at home only. The same markup carries a
      // permalink, a profile grid and a DM thread, all opened deliberately.
      var path = location.pathname;
      var root = document.documentElement;
      if (path === '/' || path === '') root.setAttribute('data-pleasefocus-home', '');
      else root.removeAttribute('data-pleasefocus-home');

      if (opts.hideReelsInFeed) {
        var spans = document.querySelectorAll('span, div, a');
        for (var i = 0; i < spans.length; i++) {
          var node = spans[i];
          var text = (node.textContent || '').trim();
          if (text === 'Reel' || text === 'Reels') {
            var article = node.closest('article');
            if (article) article.style.setProperty('display', 'none', 'important');
          }
        }
        var reelLinks = document.querySelectorAll('a[href*="/reel/"]');
        for (var j = 0; j < reelLinks.length; j++) {
          var article2 = reelLinks[j].closest('article');
          if (article2) article2.style.setProperty('display', 'none', 'important');
        }
      }

      // Restore anything previously collapsed that has since grown a post
      // inside it — the feed can be briefly empty while loading, and an empty
      // feed column looks exactly like the story rail.
      var flagged = document.querySelectorAll('[' + RAIL_FLAG + ']');
      for (var f = 0; f < flagged.length; f++) {
        if (!opts.hideStories || flagged[f].querySelector('article')) {
          flagged[f].style.removeProperty('display');
          flagged[f].removeAttribute(RAIL_FLAG);
        }
      }
      if (!opts.hideStories) return;
      if (!root.hasAttribute('data-pleasefocus-home')) return;

      // Walk up from a story link to the outermost ancestor that still looks
      // like just the carousel: more than one story link, no <article> inside.
      var link = document.querySelector('main a[href^="/stories/"]');
      if (!link) return;
      var cursor = link.parentElement;
      var rail = null;
      // Ten levels clears the carousel's wrappers well before <main>.
      for (var k = 0; k < 10 && cursor; k++) {
        if (cursor === document.body || cursor.tagName === 'MAIN') break;
        if (cursor.querySelector('article')) break;
        if (cursor.querySelectorAll('a[href^="/stories/"]').length > 1) rail = cursor;
        cursor = cursor.parentElement;
      }
      if (!rail) return;
      rail.setAttribute(RAIL_FLAG, '');
      rail.style.setProperty('display', 'none', 'important');
    }`,
    redirectTarget: `function(path) {
      if (!opts.blockReelsNavigation) return null;
      if (path.indexOf('/reels') === 0 || path.indexOf('/reel/') === 0) return '/';
      return null;
    }`,
    interceptSelector: 'a[href*="/reels"], a[href*="/reel/"]',
    onInterceptedLink: `function(link, e) {
      if (!opts.blockReelsNavigation) return;
      e.preventDefault();
      e.stopPropagation();
    }`,
  });
}
