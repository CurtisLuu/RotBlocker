import AsyncStorage from "@react-native-async-storage/async-storage";
import {
  DEFAULT_INSTAGRAM_FILTERS,
  type InstagramFilterOptions,
} from "../filters/instagram";

const FILTERS_KEY = "rotblocker.instagram.filters";
const TUTORIAL_KEY = "rotblocker.tutorial.completed";
const SELECTION_KEY = "rotblocker.native.selection";
const BLOCK_ACTIVE_KEY = "rotblocker.native.blockActive";

export async function loadInstagramFilters(): Promise<InstagramFilterOptions> {
  try {
    const raw = await AsyncStorage.getItem(FILTERS_KEY);
    if (!raw) return DEFAULT_INSTAGRAM_FILTERS;
    return { ...DEFAULT_INSTAGRAM_FILTERS, ...JSON.parse(raw) };
  } catch {
    return DEFAULT_INSTAGRAM_FILTERS;
  }
}

export async function saveInstagramFilters(
  options: InstagramFilterOptions
): Promise<void> {
  await AsyncStorage.setItem(FILTERS_KEY, JSON.stringify(options));
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
