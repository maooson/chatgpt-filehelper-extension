import Browser from 'webextension-polyfill'

export function detectSystemColorScheme() {
  if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
    return 'dark'
  }
  return 'light'
}

export function getExtensionVersion() {
  return Browser.runtime.getManifest().version
}
