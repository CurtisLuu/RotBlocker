/**
 * Shared scaffolding for the per-site filter scripts.
 *
 * Every site Please Focus! filters needs the same four things, and only the
 * selectors differ:
 *
 * 1. A stylesheet that hides the short-form surfaces, re-asserted after the
 *    page rewrites its own head.
 * 2. Inline video, so playback stays in the page instead of being handed to
 *    the fullscreen OS player.
 * 3. A pass that runs again on every DOM mutation — these are all SPAs, so
 *    content arrives long after load.
 * 4. A guard that sends the user somewhere else when a short-form URL opens.
 *
 * The site modules (`filters/instagram.ts`, `filters/youtube.ts`) supply the
 * parts that differ as JS source strings, because the whole thing ends up as
 * one string injected into a WebView. Keep those sources plain ES5 — they run
 * inside whatever engine the page got, with no transpiling.
 */

export type FilterScriptSpec = {
  /**
   * Property on `window` marking the script as installed. Kept per-site so a
   * user who visits both sites in one session doesn't get one script's guard
   * suppressing the other's.
   */
  installFlag: string;
  /** id of the injected <style> element. */
  styleId: string;
  /** The user's toggles, readable as `opts` from every source string below. */
  options: Record<string, boolean>;
  /** Site rules, appended after the shared ones. Already filtered by `opts`. */
  css: string[];
  /**
   * JS function source — `function() { ... }` — run on every pass, after the
   * shared work. For rules CSS can't express, like hiding an ancestor.
   */
  extraApply?: string;
  /**
   * JS function source — `function(path, search) { return url | null }`.
   * Returning a URL replaces the current location with it. Called on install,
   * on every pass, and whenever the SPA changes its URL.
   */
  redirectTarget?: string;
  /** Selector for links caught during the capture phase. Empty = none. */
  interceptSelector?: string;
  /**
   * JS function source — `function(link, event) { ... }`. Runs for links
   * matching `interceptSelector` and owns the decision: it must cancel the
   * event itself, so a toggle turned off can let the click through. Omit to
   * swallow every matching click.
   */
  onInterceptedLink?: string;
};

/**
 * Builds injected JS that runs at document start and re-applies on mutations.
 *
 * Injecting the same script again after the options change doesn't reinstall
 * it — it hands the new options to the copy already running, so the toolbar's
 * "Re-apply" and a settings change both take effect without a reload.
 */
export function buildFilterScript(spec: FilterScriptSpec): string {
  const flag = spec.installFlag;
  return `
(function() {
  var opts = ${JSON.stringify(spec.options)};
  var siteCss = ${JSON.stringify(spec.css)};

  var running = window.${flag};
  if (running && running.pleasefocus) {
    running.update(opts, siteCss);
    return;
  }

  var STYLE_ID = ${JSON.stringify(spec.styleId)};
  var INTERCEPT = ${JSON.stringify(spec.interceptSelector || "")};
  var extraApply = ${spec.extraApply || "null"};
  var redirectTarget = ${spec.redirectTarget || "null"};
  var onInterceptedLink = ${spec.onInterceptedLink || "null"};

  // Ask the page for its dark treatment. These sites key their own CSS off
  // prefers-color-scheme, which a page can't set for itself — but the WebView
  // inherits that from the app (dark), so this mainly stops the white canvas
  // flashing through before their stylesheet lands.
  var BASE_CSS = [
    ':root { color-scheme: dark; }',
    // Hide the control that hands playback to the fullscreen OS player.
    'video::-webkit-media-controls-fullscreen-button { display: none !important; }'
  ];

  function ensureStyle() {
    var el = document.getElementById(STYLE_ID);
    if (!el) {
      el = document.createElement('style');
      el.id = STYLE_ID;
      (document.head || document.documentElement).appendChild(el);
    }
    var css = BASE_CSS.concat(siteCss).join('\\n');
    if (el.textContent !== css) el.textContent = css;
  }

  /**
   * Keep video in the page instead of handing it to the OS player.
   *
   * Two halves are needed. The WebView has to allow inline playback at all
   * (see FilteredBrowserScreen), and every <video> has to carry playsinline
   * before it starts — set it after playback begins and iOS has already taken
   * over. New videos stream in constantly as you scroll, so this reruns on
   * mutation.
   */
  function keepVideoInline() {
    var videos = document.getElementsByTagName('video');
    for (var v = 0; v < videos.length; v++) {
      var video = videos[v];
      if (video.__pleasefocusInline) continue;
      video.__pleasefocusInline = true;
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

  function guardNavigation() {
    if (!redirectTarget) return;
    var target = redirectTarget(location.pathname, location.search);
    if (!target) return;
    if (target === location.pathname + location.search) return;
    history.replaceState(null, '', target);
    location.replace(target);
  }

  function apply() {
    ensureStyle();
    keepVideoInline();
    if (extraApply) extraApply();
    guardNavigation();
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
    if (!INTERCEPT) return;
    var t = e.target;
    if (!t || !t.closest) return;
    var link = t.closest(INTERCEPT);
    if (!link) return;
    if (onInterceptedLink) {
      onInterceptedLink(link, e);
      return;
    }
    e.preventDefault();
    e.stopPropagation();
  }, true);

  var last = location.href;
  setInterval(function() {
    if (location.href !== last) {
      last = location.href;
      apply();
    }
  }, 500);

  window.${flag} = {
    pleasefocus: true,
    /** Re-injection path: same script, new toggles, no reload. */
    update: function(nextOpts, nextCss) {
      opts = nextOpts;
      siteCss = nextCss;
      apply();
    }
  };
})();
true;
`;
}

/**
 * Helper for the `extraApply` sources: hide a node the way the sites' own
 * stylesheets can't argue with.
 */
export const HIDE_NODE_SOURCE = `
  function hideNode(node) {
    if (!node || node.__pleasefocusHidden) return;
    node.__pleasefocusHidden = true;
    node.style.setProperty('display', 'none', 'important');
  }
`;
