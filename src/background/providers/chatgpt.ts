import ExpiryMap from 'expiry-map'
import { v4 as uuidv4 } from 'uuid'
import { fetchExtensionConfigs } from '../../api'
import { fetchSSE } from '../fetch-sse'
import { ConversationResponseEvent, GptResponse, Provider, RequestParams } from '../types'

async function request(token: string, method: string, path: string, data: unknown) {
  return fetch(`https://chat.openai.com/backend-api${path}`, {
    method,
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(data),
  })
}

export async function sendMessageFeedback(token: string, data: unknown) {
  await request(token, 'POST', '/conversation/message_feedback', data)
}

export async function setConversationProperty(
  token: string,
  conversationId: string,
  propertyObject: object,
) {
  await request(token, 'PATCH', `/conversation/${conversationId}`, propertyObject)
}

const KEY_ACCESS_TOKEN = 'accessToken'

// AccessToken TTL 1小时
const cache = new ExpiryMap(5 * 60 * 1000)

export async function getAccessToken(): Promise<string> {
  if (cache.get(KEY_ACCESS_TOKEN)) {
    return cache.get(KEY_ACCESS_TOKEN)
  }
  const resp = await fetch('https://chat.openai.com/api/auth/session', {
    credentials: 'include',
    headers: {
      pragma: 'no-cache',
      referer: 'https://chat.openai.com/chat',
      'sec-ch-ua': '"Not_A Brand";v="99", "Google Chrome";v="109", "Chromium";v="109"',
      'sec-ch-ua-mobile': '?0',
      'sec-ch-ua-platform': '"Windows"',
      'sec-fetch-dest': 'empty',
      'sec-fetch-mode': 'cors',
      'sec-fetch-site': 'same-origin',
      'user-agent':
        'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/109.0.0.0 Safari/537.36',
    },
    referrer: 'https://chat.openai.com/chat',
    mode: 'same-origin',
  })
  if (resp.status === 403) {
    throw new Error('CLOUDFLARE')
  }
  const data = await resp.json().catch(() => ({}))
  if (!data.accessToken) {
    throw new Error('UNAUTHORIZED')
  }
  cache.set(KEY_ACCESS_TOKEN, data.accessToken)
  return data.accessToken
}

async function fetchModelName() {
  try {
    const configs = await fetchExtensionConfigs()
    return configs.chatgpt_webapp_model_name
  } catch (err) {
    console.error(err)
    return null
  }
}

export class ChatGPTProvider implements Provider {
  constructor(private token: string) {
    this.token = token
  }

  async callGPT(params: RequestParams) {
    const conversationId = params.request?.conversationId,
      parentMessageId = params.request?.parentMessageId || uuidv4(),
      messageId = uuidv4()

    const cleanup = () => {
      // if (conversationId) {
      //   setConversationProperty(this.token, conversationId, { is_visible: false })
      // }
    }

    const payload: any = {
      action: 'next',
      messages: [
        {
          id: messageId,
          role: 'user',
          content: {
            content_type: 'text',
            parts: [params.request.prompt],
          },
        },
      ],
      model: (await fetchModelName()) || 'text-davinci-002-render',
      parent_message_id: parentMessageId,
    }

    if (conversationId) {
      payload.conversation_id = conversationId
    }

    const result: GptResponse = {
      completion: '',
    }

    await fetchSSE('https://chat.openai.com/backend-api/conversation', {
      method: 'POST',
      signal: params.signal,
      headers: {
        'Content-Type': 'application/json',
        Accept: 'text/event-stream',
        Authorization: `Bearer ${this.token}`,
      },
      body: JSON.stringify(payload),
      onMessage(data: string) {
        // console.debug('sse message', data)
        if (data === '[DONE]') {
          params.onEvent(result)
          cleanup()
          return
        }

        try {
          const convoResponseEvent: ConversationResponseEvent = JSON.parse(data)
          if (convoResponseEvent.conversation_id) {
            result.conversationId = convoResponseEvent.conversation_id
          }

          if (convoResponseEvent.message) {
            result.messageId = convoResponseEvent.message.id
            const text = convoResponseEvent.message.content?.parts?.[0]
            if (text) {
              result.completion = text
            }
          }
        } catch (err) {
          // console.error(err)
          return
        }
      },
    })
    return { cleanup }
  }
}
