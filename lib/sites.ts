/**
 * The sites RotBlocker will browse for you, and what it hides on each.
 *
 * One entry per site, holding everything the rest of the app needs to know:
 * where to go, what to inject, what to persist, and which toggles to show.
 * The browser screen and the home screen both read from here, so adding a
 * site is a matter of writing its filter manifest and adding it below.
 *
 * TikTok is deliberately absent. It has no long-form side to keep, so there
 * is nothing to filter — it's handled on the blocking screen instead.
 */

import type { IconName } from "../components/Kit";
import {
  buildInstagramFilterScript,
  DEFAULT_INSTAGRAM_FILTERS,
  isInstagramReelsUrl,
  type InstagramFilterOptions,
} from "../filters/instagram";
import {
  buildYouTubeFilterScript,
  DEFAULT_YOUTUBE_FILTERS,
  isYouTubeShortsFeedUrl,
  YOUTUBE_URL,
  type YouTubeFilterOptions,
} from "../filters/youtube";
import {
  loadInstagramFilters,
  loadYouTubeFilters,
  saveInstagramFilters,
  saveYouTubeFilters,
} from "./settings";

export type SiteKey = "instagram" | "youtube";

export type FilterToggle<T> = {
  key: keyof T & string;
  label: string;
  icon: IconName;
};

export type FilteredSite<T extends Record<string, boolean>> = {
  key: SiteKey;
  name: string;
  url: string;
  icon: IconName;
  /** What the browser toolbar reports, e.g. "Reels hidden". */
  hiddenLabel: string;
  defaults: T;
  load: () => Promise<T>;
  save: (options: T) => Promise<void>;
  buildScript: (options: T) => string;
  /** Top-level navigations the WebView refuses before they start loading. */
  blocksUrl: (url: string, options: T) => boolean;
  toggles: FilterToggle<T>[];
};

export const INSTAGRAM_SITE: FilteredSite<InstagramFilterOptions> = {
  key: "instagram",
  name: "Instagram",
  url: "https://www.instagram.com/",
  icon: "logo-instagram",
  hiddenLabel: "Reels hidden",
  defaults: DEFAULT_INSTAGRAM_FILTERS,
  load: loadInstagramFilters,
  save: saveInstagramFilters,
  buildScript: buildInstagramFilterScript,
  blocksUrl: (url, options) =>
    options.blockReelsNavigation && isInstagramReelsUrl(url),
  toggles: [
    { key: "hideReelsTab", label: "Reels tab", icon: "albums-outline" },
    {
      key: "hideReelsInFeed",
      label: "Reels in your feed",
      icon: "film-outline",
    },
    {
      key: "blockReelsNavigation",
      label: "Links to Reels",
      icon: "link-outline",
    },
    { key: "hideExplore", label: "Explore tab", icon: "compass-outline" },
  ],
};

export const YOUTUBE_SITE: FilteredSite<YouTubeFilterOptions> = {
  key: "youtube",
  name: "YouTube",
  url: YOUTUBE_URL,
  icon: "logo-youtube",
  hiddenLabel: "Shorts hidden",
  defaults: DEFAULT_YOUTUBE_FILTERS,
  load: loadYouTubeFilters,
  save: saveYouTubeFilters,
  buildScript: buildYouTubeFilterScript,
  // Only the Shorts feed is refused here. A single Shorts video loads and is
  // rewritten to the normal player by the injected script.
  blocksUrl: (url, options) =>
    options.blockShortsNavigation && isYouTubeShortsFeedUrl(url),
  toggles: [
    { key: "hideShortsTab", label: "Shorts tab", icon: "albums-outline" },
    {
      key: "hideShortsShelf",
      label: "Shorts on the home feed",
      icon: "film-outline",
    },
    {
      key: "hideShortsInSearch",
      label: "Shorts in search results",
      icon: "search-outline",
    },
    {
      key: "blockShortsNavigation",
      label: "Links to Shorts",
      icon: "link-outline",
    },
  ],
};
