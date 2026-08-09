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
};

export const DEFAULT_INSTAGRAM_FILTERS: InstagramFilterOptions = {
  hideReelsTab: true,
  hideReelsInFeed: true,
  hideExplore: false,
  blockReelsNavigation: true,
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

  return buildFilterScript({
    installFlag: "__rotblockerInstalled",
    styleId: "rotblocker-instagram-style",
    options: options as unknown as Record<string, boolean>,
    css,
    // CSS can hide the link but not the post around it, so walk up to the
    // <article> — either from the "Reel" badge text or from the link itself.
    extraApply: `function() {
      if (!opts.hideReelsInFeed) return;
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
