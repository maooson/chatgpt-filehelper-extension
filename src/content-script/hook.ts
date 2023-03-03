import { stripHTMLTags, withCommandSatisfied, withContentLengthSatisfied } from './utils'

const botNickName: string = "gpt"
let isFirstLogin = true;
let triggerMode = 'atGPT'

export async function pageScript() {
  console.clear();

  // Vue app hook
  const appElement = document.querySelector("#app")
  const app = await appElement?.__vue_app__;

  const postMessage = async (msg: any) => {
    console.debug('Message add success: ', msg)
    const store = await app.config.globalProperties.$store;
    const { uuid, nickname, avatar, nextDomain } = await store.state;
    if (isFirstLogin) {
      isFirstLogin = false
      const newMessageEvent = new CustomEvent(`filehelper:user:session`, { detail: { uuid, nickname, avatar, nextDomain } })
      window.dispatchEvent(newMessageEvent)
    }

    // 只监听文本消息
    const { MsgType, Content } = msg;
    if (MsgType === 1 && Content.length > 4) {
      let text = stripHTMLTags(Content)

      // 判断是否有触发关键词
      if (!withCommandSatisfied(text, botNickName)) {
        return
      }

      text = text.replaceAll(`@${botNickName}`, '').trim()
      if (!withContentLengthSatisfied(text)) {
        return
      }

      const newMessageEvent = new CustomEvent('filehelper:message:add', {
        detail: { uuid, nickname, text }
      })

      window.dispatchEvent(newMessageEvent)
    }
  }

  if (appElement && app) {
    const store = await app.config.globalProperties.$store;
    // if (chatState !== "logined") return;

    const mutations = store?._mutations;
    if (mutations) {
      if (mutations?.addMsgList.length) {
        const addMsgListFunc = mutations.addMsgList[0];
        mutations.addMsgList[0] = function (e: any, t: any) {
          if (e.length > 0) {
            postMessage(e[0])
            addMsgListFunc(e, t)
          }
        }
      }

      if (mutations?.addTextMsg.length) {
        const addTextMsgFunc = mutations.addTextMsg[0];
        mutations.addTextMsg[0] = function (e: any, t: any) {
          postMessage(e)
          addTextMsgFunc(e, t)
        }
      }
    }

    // 增加chatgpt回复消息的事件监听器
    window.addEventListener(
      'filehelper:message:gpt_reply',
      async (e: any) => {
        console.debug(`GPT Reply Message: ${e.detail}`)
        const store = await app.config.globalProperties.$store;
        if (e.detail && store.dispatch) {
          store.dispatch("sendMessage", e.detail);
        }
      },
      false,
    )

    // 增加chatgpt回复消息的事件监听器
    window.addEventListener('filehelper:setting:triggerModeChanged',
      async (e: any) => {
        console.debug(`Settings Changed: ${e.detail}`)
        if (e.detail && e.detail.triggerMode === "always") {
          triggerMode = 'alway'
        } else {
          triggerMode = 'atGPT'
        }
      },
      false,
    )
  }
}

pageScript()
