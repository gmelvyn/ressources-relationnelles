import Constants from 'expo-constants';
import * as Device from 'expo-device';
import { Platform } from 'react-native';

type ExpoConstants = {
  expoConfig?: {
    hostUri?: string | null;
  } | null;
  manifest?: {
    debuggerHost?: string | null;
    hostUri?: string | null;
  } | null;
  manifest2?: {
    extra?: {
      expoClient?: {
        hostUri?: string | null;
      } | null;
    } | null;
  } | null;
};

function expoHost() {
  const constants = Constants as ExpoConstants;
  const hostUri =
    constants.expoConfig?.hostUri ||
    constants.manifest?.hostUri ||
    constants.manifest?.debuggerHost ||
    constants.manifest2?.extra?.expoClient?.hostUri;

  return hostUri?.split(':')[0] || null;
}

function defaultApiUrl() {
  if (Platform.OS === 'android') return 'http://10.0.2.2:3000';
  return 'http://localhost:3000';
}

function normalizeApiUrl(url: string) {
  if (Platform.OS === 'web') return url;

  const host = expoHost();
  const shouldReplaceLocalhost =
    url.includes('://localhost') || url.includes('://127.0.0.1');

  if (!shouldReplaceLocalhost) return url;

  if (Platform.OS === 'android' && !Device.isDevice) {
    return url.replace(/:\/\/(localhost|127\.0\.0\.1)(?=[:/]|$)/, '://10.0.2.2');
  }

  if (host) {
    return url.replace(/:\/\/(localhost|127\.0\.0\.1)(?=[:/]|$)/, `://${host}`);
  }

  return url;
}

export const API_URL = normalizeApiUrl(process.env.EXPO_PUBLIC_API_URL || defaultApiUrl()).replace(
  /\/$/,
  '',
);

export function absoluteUrl(path?: string | null) {
  if (!path) return null;
  if (/^https?:\/\//i.test(path)) return path;
  return `${API_URL}${path.startsWith('/') ? path : `/${path}`}`;
}
