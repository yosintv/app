
export const COLORS = {
  primary: '#1f41bb',
  secondary: '#f0f4ff',
  accent: '#facc15',
  text: '#1f2937',
  gray: '#9ca3af',
  white: '#ffffff',
  error: '#ef4444',
  success: '#10b981'
};

/** 
 * APP_VERSION: Update this string whenever you release a new version.
 * The app compares this against the 'version' field in your server's version.json.
 * If they are different AND the server entry is marked 'latest: true', an update is prompted.
 */
export const APP_VERSION = '1.0.0'; 

export const API_URLS = {
  cricket: 'https://www.yosintv.link/api/cricket.json',
  football: 'https://www.yosintv.link/api/football.json',
  highlights: 'https://yosintv-api.pages.dev/api/highlights.json'
};

// URL to check for latest version
export const VERSION_CHECK_URL = 'https://www.yosintv.link/api/version.json';

// URL to your external JSON config file for ads
export const AD_CONFIG_URL = 'https://raw.githubusercontent.com/username/repo/main/ad-config.json'; 

export const LOGO_URL = 'https://web.cricfoot.net/logo.png';
export const TELEGRAM_URL = 'https://t.me/your_telegram_channel';
export const WHATSAPP_URL = 'https://wa.me/your_whatsapp_number';
