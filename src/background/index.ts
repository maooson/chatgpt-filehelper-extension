import ExpiryMap from 'expiry-map'
import Browser from 'webextension-polyfill'
import { getProviderConfigs, ProviderType } from '../config.js'
import { ChatGPTWeb, getAccessToken } from './providers/chatgpt-web.js'
import { ChatGPTAPI } from './providers/chatgpt-api.js'
import * as types from './types'
import Keyv from 'keyv'
import QuickLRU from 'quick-lru'
import { fetchConfig } from '../api.js'

// 同一个conversation的会话保持时间
const threadCache = new ExpiryMap(30 * 60 * 1000)
const DEFAULT_SYSTEM_MESSAGE = '现在你是一个在微信群的AI助手，你的名字是ChatGirl，Powered by chatgpt4wechat.com';
const messageStore = new Keyv<types.ChatMessage, any>({
  namespace: 'c4w',
  store: new QuickLRU<string, types.ChatMessage>({ maxSize: 1000 }),
  serialize: JSON.stringify,
  deserialize: JSON.parse
})

export type FileHelperMessage = {
  actualSender: string,
  question: string
  nickname: string
  avatar: string
  uuid: string
}

export interface ChatProvider {
  sendMessage(text: string, params: types.SendMessageOptions | types.SendMessageBrowserOptions): Promise<types.ChatMessage>
}

function generateThreadKey(request: FileHelperMessage, provider: string) {
  return `${provider}#${request.actualSender}`
}

async function callGPT(port: Browser.Runtime.Port, request: FileHelperMessage) {
  const providerConfigs = await getProviderConfigs()

  const controller = new AbortController()
  port.onDisconnect.addListener(() => {
    controller.abort()
  })

  const threadKey = generateThreadKey(request, providerConfigs.provider)
  const threadValue = threadCache.get(threadKey)

  let opts: types.SendMessageOptions | types.SendMessageBrowserOptions = {
    stream: true,
    abortSignal: controller.signal
  }

  let api: ChatProvider;
  if (providerConfigs.provider === ProviderType.ChatGPTWeb) {
    const token = await getAccessToken()
    api = new ChatGPTWeb({ accessToken: token, debug: true })

    const threadParts = (threadValue && threadValue.length > 4) ? threadValue.split('^^') : []
    if (threadParts.length == 2) {
      opts = {
        ...opts,
        conversationId: threadParts[0],
        parentMessageId: threadParts[1],
      }
    }
  } else if (providerConfigs.provider === ProviderType.ChatGPTAPI) {
    const { apiKey, systemMessage } = providerConfigs.configs[ProviderType.ChatGPTAPI]!
    api = new ChatGPTAPI({
      apiKey,
      systemMessage: systemMessage || DEFAULT_SYSTEM_MESSAGE,
      messageStore: messageStore,
      debug: true
    })

    if (threadValue) {
      opts = {
        ...opts,
        parentMessageId: threadValue,
      }
    }
  } else {
    throw new Error(`Unknown provider ${providerConfigs.provider}`)
  }

  await api.sendMessage(request.question, opts)
    .then((result) => {
      if (result && result.id) {
        // 消息完成后设置threadKey
        if (providerConfigs.provider === ProviderType.ChatGPTWeb) {
          threadCache.set(threadKey, `${result.conversationId}^^${result.id}`)
        } else if (providerConfigs.provider === ProviderType.ChatGPTAPI) {
          threadCache.set(threadKey, result.id)
        }
        port.postMessage({ ...request, reply: result.text })
      }
    })
    .catch((err: any) => {
      port.postMessage({ ...request, error: err.message })
    })
}

Browser.runtime.onConnect.addListener((port: any) => {
  port.onMessage.addListener(async (request: any) => {
    console.debug('ChatGPT: received msg', request)
    await callGPT(port, request)
  })
})

Browser.runtime.onMessage.addListener(async (message: any) => {
  if (message.type === 'OPEN_OPTIONS_PAGE') {
    Browser.runtime.openOptionsPage()
  } else if (message.type === 'GET_ACCESS_TOKEN') {
    return getAccessToken()
  } else if (message.type === 'CHECK_API_STATE') {
    const apiKey = message.data
    const api = new ChatGPTAPI({ apiKey, debug: true })
    return await api.checkUsage()
  }
})

Browser.runtime.onInstalled.addListener((details) => {
  if (details.reason === 'install') {
    Browser.runtime.openOptionsPage()

    fetchConfig().then((res) => {
      console.debug('Load extension config: ', res)
      Browser.storage.local.set(res);
    }).catch(err => {
      console.error(err);
    })
  }
})
