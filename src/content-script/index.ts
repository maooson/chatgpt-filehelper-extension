import ExpiryMap from 'expiry-map'
import 'github-markdown-css'
import Browser from 'webextension-polyfill'
import { captureEvent } from '../analytics'

const MSGTYPE_TEXT = 'MSGTYPE_TEXT'
const COPYRIGHT = 'Generated by GPT'
const GPT_RATELIMIT = 10
const SHOW_COPYRIGHT = false

// 提问次数限制
const cache = new ExpiryMap(30 * 60 * 1000)

function registerFileHelperHook(hook: string) {
  const script = hook + '.js'

  const s = document.createElement('script')
  s.type = 'text/javascript'
  s.src = Browser.runtime.getURL(script)
  s.async = true
  document.head.appendChild(s)
}

window.addEventListener(
  'filehelper:message:add',
  (e: any) => {
    console.info('Got a new @ChatGPTBot message', e.detail)
    const { text } = e.detail

    // 判断是否有触发关键词
    if (text) {
      if (!withRateLimitSatisfied("fileHelper")) {
        const response = {
          reply: '抱歉，你的提问太频繁了，请等一会儿再来问吧~',
        }
        reply(response)
        return
      }

      console.info(`🤖 Trigger GPT: ${text}`)
      const port = Browser.runtime.connect()
      const listener = (response: any) => {
        if (response && response.reply) {
          reply(response)
          captureEvent('chatgpt:response:success', { ...response })
        } else if (response.error) {
          response.reply = `抱歉，ChatGPT服务异常，错误代码：${response.error}，请联系开发者看看 https://aow.me`
          reply(response)
          captureEvent('chatgpt:response:error', { ...response })
        } else {
          console.error('Call ChatGPT EXCEPTION')
        }
      }
      port.onMessage.addListener(listener)
      port.postMessage({
        question: text,
      })
      return () => {
        port.onMessage.removeListener(listener)
        port.disconnect()
      }
    }
  },
  false,
)

function withRateLimitSatisfied(actualSender: string) {
  const count = cache.get(actualSender) || 0

  if (count < GPT_RATELIMIT) {
    cache.set(actualSender, count + 1)
    return true
  }

  return false
}

function reply(response: any) {
  console.info('😀 ChatGPT response: ', response)

  let content = response.reply
  // 是否群组消息
  if (SHOW_COPYRIGHT) {
    content = `${content}\n${COPYRIGHT}`
  }

  const msg = {
    MsgTypeText: MSGTYPE_TEXT,
    Content: content,
  }

  const event = new CustomEvent('filehelper:message:gpt_reply', {
    detail: msg,
  })

  window.dispatchEvent(event)
}

console.log('DOM loaded and register fileHelper hook.')
registerFileHelperHook('hook')
