import { Platform } from "react-native";
import Constants from "expo-constants";

/**
 * Screen Time / ManagedSettings only exist in a real native build
 * (dev client, EAS, or local Xcode). Expo Go cannot load them.
 */
export function isNativeBlockingAvailable(): boolean {
  if (Platform.OS !== "ios" && Platform.OS !== "android") return false;
  // Expo Go
  if (Constants.appOwnership === "expo") return false;
  // StoreClient is another Expo Go signal on some versions
  if (Constants.executionEnvironment === "storeClient") return false;
  return true;
}

export type NativeBlockModule = typeof import("expo-app-blocker");

export function getNativeBlockModule(): NativeBlockModule | null {
  if (!isNativeBlockingAvailable()) return null;
  try {
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    return require("expo-app-blocker") as NativeBlockModule;
  } catch {
    return null;
  }
}
