import AsyncStorage from "@react-native-async-storage/async-storage";
import {
  DEFAULT_INSTAGRAM_FILTERS,
  type InstagramFilterOptions,
} from "../filters/instagram";
import {
  DEFAULT_YOUTUBE_FILTERS,
  type YouTubeFilterOptions,
} from "../filters/youtube";

const INSTAGRAM_FILTERS_KEY = "pleasefocus.instagram.filters";
const YOUTUBE_FILTERS_KEY = "pleasefocus.youtube.filters";
const TUTORIAL_KEY = "pleasefocus.tutorial.completed";
const SELECTION_KEY = "pleasefocus.native.selection";
const BLOCK_ACTIVE_KEY = "pleasefocus.native.blockActive";

/**
 * Filters are stored per site, and read back merged over the defaults: a
 * release that adds a toggle picks up its default for anyone whose stored
 * object predates it, rather than arriving as `undefined`.
 */
async function loadFilters<T extends object>(
  key: string,
  defaults: T
): Promise<T> {
  try {
    const raw = await AsyncStorage.getItem(key);
    if (!raw) return defaults;
    return { ...defaults, ...JSON.parse(raw) };
  } catch {
    return defaults;
  }
}

export async function loadInstagramFilters(): Promise<InstagramFilterOptions> {
  return loadFilters(INSTAGRAM_FILTERS_KEY, DEFAULT_INSTAGRAM_FILTERS);
}

export async function saveInstagramFilters(
  options: InstagramFilterOptions
): Promise<void> {
  await AsyncStorage.setItem(INSTAGRAM_FILTERS_KEY, JSON.stringify(options));
}

export async function loadYouTubeFilters(): Promise<YouTubeFilterOptions> {
  return loadFilters(YOUTUBE_FILTERS_KEY, DEFAULT_YOUTUBE_FILTERS);
}

export async function saveYouTubeFilters(
  options: YouTubeFilterOptions
): Promise<void> {
  await AsyncStorage.setItem(YOUTUBE_FILTERS_KEY, JSON.stringify(options));
}

export async function hasCompletedTutorial(): Promise<boolean> {
  try {
    return (await AsyncStorage.getItem(TUTORIAL_KEY)) === "1";
  } catch {
    return false;
  }
}

export async function markTutorialCompleted(): Promise<void> {
  await AsyncStorage.setItem(TUTORIAL_KEY, "1");
}

export async function loadNativeSelection(): Promise<string> {
  try {
    return (await AsyncStorage.getItem(SELECTION_KEY)) ?? "";
  } catch {
    return "";
  }
}

export async function saveNativeSelection(selectionData: string): Promise<void> {
  await AsyncStorage.setItem(SELECTION_KEY, selectionData);
}

export async function loadBlockActive(): Promise<boolean> {
  try {
    return (await AsyncStorage.getItem(BLOCK_ACTIVE_KEY)) === "1";
  } catch {
    return false;
  }
}

export async function saveBlockActive(active: boolean): Promise<void> {
  await AsyncStorage.setItem(BLOCK_ACTIVE_KEY, active ? "1" : "0");
}
