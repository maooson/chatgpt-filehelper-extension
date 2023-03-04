import { getExtensionId, getExtensionVersion } from './utils'

const BASIC_API_URL = 'https://s1.chatgpt4wechat.com/api';
const VIP_API_URL = 'https://v.chatgpt4wechat.com/api'

const EXT_HEADERS = {
  headers: {
    'x-version': getExtensionVersion(),
    'x-ext-id': getExtensionId(),
  },
}

export interface PromotionResponse {
  url: string
  title: string
  text: string
  image: string
  footer?: { text: string; url: string }
  label: string
}

export type ModelResponse = {
  chatgpt_webapp_model_name: string
  chatgpt_api_model_name: string
  openai_model_names: string[]
}

export type ConfigResponse = {
  postHogToken: string
  postHogApiHost: string
  sessionMaxAge: number
  wechatRequestHeaders: {
    extspam: string
    'client-version': string
    urlfilter: string
  },
  features: {
    systemMessage: boolean
    getApiKey: boolean
    hasPromotion: boolean
    gptRateLimit: boolean
    queueThreshold: boolean
  },
  models: ModelResponse
  promotion: PromotionResponse
  templates: {
    welcomeMsgTemplate: string
    errorMsgTemplate: string
    gptRateLimitMsgTemplate: string
    notifyQueueStatusMsgTemplate: string
    systemMessageTemplate: string
    defaultPromptTemplate: string
  }
}

export async function fetchModel(): Promise<ModelResponse> {
  return fetch(`${BASIC_API_URL}/model`, EXT_HEADERS).then((r) => r.json())
}

export async function fetchConfig(): Promise<ConfigResponse> {
  return fetch(`${BASIC_API_URL}/config`, EXT_HEADERS).then((r) => r.json())
}
