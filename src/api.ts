import { getExtensionVersion } from './utils'

export interface PromotionResponse {
  url: string
  title?: string
  text?: string
  image?: { url: string; size?: number }
  footer?: { text: string; url: string }
  label?: { text: string; url: string }
}

export async function fetchPromotion(): Promise<PromotionResponse | null> {
  return fetch(`https://random.aoq.me`, {
    headers: {
      'x-version': getExtensionVersion(),
    },
  }).then((r) => r.json())
}

export async function fetchExtensionConfigs(): Promise<{
  chatgpt_webapp_model_name: string
  openai_model_names: string[]
}> {
  return fetch(`https://models.aoq.me`, {
    headers: {
      'x-version': getExtensionVersion(),
    },
  }).then((r) => r.json())
}
