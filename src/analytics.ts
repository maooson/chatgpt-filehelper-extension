import posthog from 'posthog-js'
import { getExtensionVersion } from './utils'

posthog.init('phc_1xiNW8r0LTbPjUNrSU2JrvoV3fHf150FoM1ZUcthcAZ', {
  api_host: 'https://app.posthog.com',
  persistence: 'localStorage',
  autocapture: false,
  capture_pageview: false,
  disable_session_recording: true,
  property_blacklist: ['$current_url', '$pathname'],
  loaded: (pg) => {
    pg.people.set({ ext_version: getExtensionVersion(), ext_name: 'gpt4filehelper' })
  },
})

export function captureEvent(event: string, properties?: object) {
  posthog.capture(event, properties)
}
