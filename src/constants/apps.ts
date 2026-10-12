export interface TrackedAppConfig {
  id: 'tiktok' | 'instagram';
  name: string;
  packageName: string;
  feedKeyword: string;
  brandColor: string;
}

export const TRACKED_APPS: Record<string, TrackedAppConfig> = {
  'com.zhiliaoapp.musically': {
    id: 'tiktok',
    name: 'TikTok',
    packageName: 'com.zhiliaoapp.musically',
    feedKeyword: 'For You',
    brandColor: '#FE2C55',
  },
  'com.instagram.android': {
    id: 'instagram',
    name: 'Instagram Reels',
    packageName: 'com.instagram.android',
    feedKeyword: 'Reels',
    brandColor: '#E1306C',
  },
};

export const TIKTOK_PACKAGE = 'com.zhiliaoapp.musically';
export const INSTAGRAM_PACKAGE = 'com.instagram.android';
