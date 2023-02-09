import ExpiryMap from 'expiry-map'
import { v4 as uuidv4 } from 'uuid'
import Browser from 'webextension-polyfill'
import { getProviderConfigs, ProviderType } from '../config.js'
import { ChatGPTProvider, getAccessToken, sendMessageFeedback } from './providers/chatgpt.js'
import { OpenAIProvider } from './providers/openai.js'
import * as types from './types'

// 同一个conversation的会话保持时间
const threadCache = new ExpiryMap(30 * 60 * 1000)

function generateThreadKey(request: types.FileHelperMessage, provider: string) {
  return `${provider}#${request.actualSender}`
}

async function callGPT(port: Browser.Runtime.Port, request: types.FileHelperMessage) {
  const providerConfigs = await getProviderConfigs()

  let provider: types.Provider
  if (providerConfigs.provider === ProviderType.ChatGPT) {
    const token = await getAccessToken()
    provider = new ChatGPTProvider(token)
  } else if (providerConfigs.provider === ProviderType.GPT3) {
    const { apiKey, model } = providerConfigs.configs[ProviderType.GPT3]!
    provider = new OpenAIProvider(apiKey, model)
  } else {
    throw new Error(`Unknown provider ${providerConfigs.provider}`)
  }

  const controller = new AbortController()
  port.onDisconnect.addListener(() => {
    controller.abort()
    cleanup?.()
  })

  const threadKey = generateThreadKey(request, providerConfigs.provider)
  const threadValue = threadCache.get(threadKey)

  const gptRequest: types.GptRequest = {
    prompt: request.question,
  }
  if (threadValue && threadValue.length > 4) {
    const parts = threadValue.split('^^')
    gptRequest.conversationId = parts[0]
    gptRequest.parentMessageId = parts[1] || uuidv4()
  }

  if (!gptRequest.conversationId && providerConfigs.provider === ProviderType.GPT3) {
    gptRequest.conversationId = request.actualSender
  }

  const { cleanup } = await provider.callGPT({
    request: gptRequest,
    signal: controller.signal,
    onEvent(resp: types.GptResponse) {
      if (resp.conversationId && resp.messageId) {
        // 消息完成后设置threadKey
        threadCache.set(threadKey, `${resp.conversationId}^^${resp.messageId}`)
        port.postMessage({ ...request, reply: resp.completion })
        return
      }
    },
  })
}

Browser.runtime.onConnect.addListener((port: any) => {
  port.onMessage.addListener(async (request: any) => {
    console.debug('ChatGPT: received msg', request)
    try {
      await callGPT(port, request)
    } catch (err: any) {
      console.log(err)
      port.postMessage({ ...request, error: err.message })
    }
  })
})

Browser.runtime.onMessage.addListener(async (message: any) => {
  if (message.type === 'FEEDBACK') {
    const token = await getAccessToken()
    await sendMessageFeedback(token, message.data)
  } else if (message.type === 'OPEN_OPTIONS_PAGE') {
    Browser.runtime.openOptionsPage()
  } else if (message.type === 'GET_ACCESS_TOKEN') {
    return getAccessToken()
  }
})

Browser.runtime.onInstalled.addListener((details) => {
  if (details.reason === 'install') {
    Browser.runtime.openOptionsPage()
  }
})
