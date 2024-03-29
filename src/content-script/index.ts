import ExpiryMap from 'expiry-map'
import Browser from 'webextension-polyfill'
import { captureEvent, identify } from '../analytics'
import { GptRateLimit, QueueThreshold, getUserConfig } from '../config'

const MSGTYPE_TEXT = 'MSGTYPE_TEXT'
const COPYRIGHT = 'Generated by GPT'
const HAS_RATELIMIT = true
const SHOW_COPYRIGHT = false

// 提问次数限制
let gptRateLimit: GptRateLimit = GptRateLimit.NONE
let queueThreshold: QueueThreshold = QueueThreshold.T5
const RESET_QUEUE_THRESHOLD = 10
const cache = new ExpiryMap(10 * 60 * 1000)
const messageQueue: any[] = []
let isProcessing = false

function registerFileHelperHook(hook: string) {
  const script = hook + '.js'

  const s = document.createElement('script')
  s.type = 'text/javascript'
  s.src = Browser.runtime.getURL(script)
  s.async = true
  document.head.appendChild(s)
}

// 调用GPT获得问题响应
function callGpt(message: any) {
  isProcessing = true
  const { uuid, nickname, text } = message

  console.info(`🤖 Trigger GPT: ${text}`)
  const port = Browser.runtime.connect()
  const listener = (response: any) => {
    isProcessing = false
    if (response && response.reply) {
      reply(response)
      captureEvent('chatgpt:response:success', { ...response })
    } else if (response.error) {
      response.reply = `抱歉出错啦，错误代码：${response.error}，请到开发者网站看一下吧 https://chatgpt4wechat.com`
      reply(response)
      captureEvent('chatgpt:response:error', { ...response })
    } else {
      console.error('Call ChatGPT EXCEPTION')
    }
  }
  port.onMessage.addListener(listener)
  port.postMessage({
    actualSender: uuid || 'filehelper',
    nickname: nickname,
    uuid: uuid,
    question: text,
  })
  return () => {
    isProcessing = false
    port.onMessage.removeListener(listener)
    port.disconnect()
  }
}

// 回答当前队列中的第一个消息
function processNext() {
  // 如果队列为空，结束函数
  if (messageQueue.length === 0) {
    return;
  }

  // 取出队列中的第一个消息，并回答
  const message = messageQueue.shift();
  callGpt(message);
}

// 回答消息，并在回答完后调用 processNext 处理下一个
function reply(response: any) {
  console.info('😀 ChatGPT response: ', response)

  let content = response.reply
  if (content && content.length > 0) {
    content = content.trim();

    // 是否加上版权信息
    if (SHOW_COPYRIGHT) {
      content = `${content}\n${COPYRIGHT}`
    }

    // 回复内容中不能出现触发命令的关键字
    content = content.replaceAll('@gpt', '')

    const msg = {
      MsgTypeText: MSGTYPE_TEXT,
      Content: content,
    }

    const event = new CustomEvent('filehelper:message:gpt_reply', {
      detail: msg,
    })

    window.dispatchEvent(event)
  }

  // 处理下一条消息
  processNext()
}

// 发送一条消息告知当前排队人数
function notifyQueueStatus(queueLength: number) {
  const msg = {
    MsgTypeText: MSGTYPE_TEXT,
    Content: `哎呀，我还有${queueLength}个问题要回答呢，让我歇会儿吧~~`,
  }

  const event = new CustomEvent('filehelper:message:gpt_reply', {
    detail: msg,
  })

  window.dispatchEvent(event)
}

window.addEventListener(
  'filehelper:user:session',
  (e: any) => {
    const msg = e.detail;
    // console.info(`User: ${msg.uuid}, detail: `, msg)
    identify(msg)
  },
  false,
)

window.addEventListener(
  'filehelper:message:add',
  (e: any) => {
    console.info('Got a new @gpt message', e.detail)
    if (HAS_RATELIMIT && !withRateLimitSatisfied("fileHelper")) {
      const response = {
        reply: '抱歉，你的提问太频繁了，请等一会儿再来问吧~',
      }
      reply(response)
      return
    }

    // 如果队列为空且没有正在处理中的问题，无则直接回答
    if (!isProcessing && messageQueue.length === 0) {
      callGpt(e.detail);
    }
    // 否则加入队列排队
    else {
      messageQueue.push(e.detail);
      // 如果队列长度超过阈值，发送一条消息告知当前排队问题数量
      if (messageQueue.length > queueThreshold) {
        notifyQueueStatus(messageQueue.length);
      } else if (messageQueue.length > RESET_QUEUE_THRESHOLD) {
        messageQueue.length = 0
        callGpt(e.detail)
      }
    }
  },
  false,
)

function withRateLimitSatisfied(actualSender: string) {
  const count = cache.get(actualSender) || 0

  if (count < gptRateLimit) {
    cache.set(actualSender, count + 1)
    return true
  }

  return false
}

async function loadUserConfig() {
  let userConfig = await getUserConfig();
  // 提问次数频率限制
  gptRateLimit = userConfig.gptRateLimit || GptRateLimit.NONE
  // 队列积压消息通报阈值
  queueThreshold = userConfig.queueThreshold || QueueThreshold.T5

  // 监听配置变化
  Browser.storage.onChanged.addListener(async (changes, area) => {
    if (area === 'local' && changes.gptRateLimit?.newValue) {
      const newVaule = parseInt(changes.gptRateLimit.newValue);
      console.debug('New GptRateLimit Value', newVaule);
      gptRateLimit = newVaule || GptRateLimit.NONE
    }

    if (area === 'local' && changes.queueThreshold?.newValue) {
      const newVaule = parseInt(changes.queueThreshold.newValue);
      console.debug('New QueueThreshold Value', newVaule);
      gptRateLimit = newVaule || QueueThreshold.T5
    }

    if (area === 'local' && changes.triggerMode?.newValue) {
      const newVaule = changes.triggerMode.newValue;
      console.debug('New TriggerMode Value', newVaule);
      const event = new CustomEvent('filehelper:setting:triggerModeChanged', {
        detail: { triggerMode: newVaule },
      })

      window.dispatchEvent(event)
    }
  });
}

console.log('DOM loaded and register fileHelper hook.')
registerFileHelperHook('hook')
loadUserConfig().then(() => {
  console.log('Load user config completed.')
})
