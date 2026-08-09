/**
 * Instagram filter manifest.
 * Prefer href / aria / role selectors — Meta rotates class names often.
 * PRs welcome when Instagram redesigns break these.
 */

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

/** Builds injected JS that runs at document start and on DOM mutations. */
export function buildInstagramFilterScript(
  options: InstagramFilterOptions
): string {
  const opts = JSON.stringify(options);
  return `
(function() {
  if (window.__rotblockerInstalled) return;
  window.__rotblockerInstalled = true;
  var opts = ${opts};

  var STYLE_ID = 'rotblocker-instagram-style';
  function ensureStyle() {
    // Ask the page for its dark treatment. Instagram's own CSS keys off
    // prefers-color-scheme, which a page can't set for itself — but the
    // WebView inherits that from the app (dark), so this mainly stops the
    // white canvas flashing through before their stylesheet lands.
    var css = [
      ':root { color-scheme: dark; }',
      // Hide the control that hands playback to the fullscreen OS player.
      'video::-webkit-media-controls-fullscreen-button { display: none !important; }'
    ];
    if (opts.hideReelsTab) {
      css.push(
        'a[href="/reels/"], a[href^="/reels?"], a[href*="/reels/"] { display: none !important; }',
        'a[role="link"][href="/reels/"] { display: none !important; }',
        'svg[aria-label="Reels"] { display: none !important; }',
        'a[href="/reels/"] { pointer-events: none !important; }'
      );
    }
    if (opts.hideExplore) {
      css.push(
        'a[href="/explore/"], a[href^="/explore?"] { display: none !important; }',
        'svg[aria-label="Explore"] { display: none !important; }'
      );
    }
    if (opts.hideReelsInFeed) {
      css.push(
        'article a[href*="/reel/"] { display: none !important; }'
      );
    }
    var el = document.getElementById(STYLE_ID);
    if (!el) {
      el = document.createElement('style');
      el.id = STYLE_ID;
      (document.head || document.documentElement).appendChild(el);
    }
    el.textContent = css.join('\\n');
  }

  function hideReelArticles() {
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
  }

  /**
   * Keep video in the page instead of handing it to the OS player.
   *
   * Two halves are needed. The WebView has to allow inline playback at all
   * (see InstagramScreen), and every <video> has to carry playsinline before
   * it starts — set it after playback begins and iOS has already taken over.
   * New videos stream in constantly as you scroll, so this reruns on mutation.
   */
  function keepVideoInline() {
    var videos = document.getElementsByTagName('video');
    for (var v = 0; v < videos.length; v++) {
      var video = videos[v];
      if (video.__rotblockerInline) continue;
      video.__rotblockerInline = true;
      video.setAttribute('playsinline', '');
      video.setAttribute('webkit-playsinline', '');
      video.setAttribute('disablePictureInPicture', '');
      // Belt and braces: neuter the calls that would escalate to fullscreen.
      video.webkitEnterFullscreen = function() {};
      video.webkitEnterFullScreen = function() {};
      video.requestFullscreen = function() { return Promise.resolve(); };
      video.webkitRequestFullscreen = function() {};
    }
  }

  function blockReelsNav() {
    if (!opts.blockReelsNavigation) return;
    if (location.pathname.indexOf('/reels') === 0 || location.pathname.indexOf('/reel/') === 0) {
      history.replaceState(null, '', '/');
      location.replace('/');
    }
  }

  function apply() {
    ensureStyle();
    keepVideoInline();
    hideReelArticles();
    blockReelsNav();
  }

  apply();

  var scheduled = false;
  function schedule() {
    if (scheduled) return;
    scheduled = true;
    requestAnimationFrame(function() {
      scheduled = false;
      apply();
    });
  }

  var observer = new MutationObserver(schedule);
  observer.observe(document.documentElement, { childList: true, subtree: true });

  document.addEventListener('click', function(e) {
    if (!opts.blockReelsNavigation) return;
    var t = e.target;
    if (!t || !t.closest) return;
    var link = t.closest('a[href*="/reels"], a[href*="/reel/"]');
    if (link) {
      e.preventDefault();
      e.stopPropagation();
    }
  }, true);

  var last = location.href;
  setInterval(function() {
    if (location.href !== last) {
      last = location.href;
      apply();
    }
  }, 500);
})();
true;
`;
}
