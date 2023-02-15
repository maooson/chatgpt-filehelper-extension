import { withOptionsSatisfied } from './utils'

const botNickName: string = "gpt"

export async function pageScript() {
  console.clear();

  const removeImgTag = (str: string) => {
    const imgReg = /<img.*?(?:>|\/>)/gi

    const imgArr = str.match(imgReg)
    if (imgArr != null && imgArr != undefined) {
      for (const vm of imgArr) {
        str = str.replace(vm, '*')
      }
    }

    return str
  }

  const postMessage = async (msg: any) => {
    console.debug('Message add success: ', msg)
    // 只监听文本消息
    const { MsgType, Content } = msg;
    if (MsgType === 1 && Content.length > 4) {
      // 判断是否有触发关键词
      if (!withOptionsSatisfied(Content, botNickName)) {
        return
      }

      let content = Content.replaceAll(`@${botNickName}`, '').trim()
      content = removeImgTag(content).trim()
      const newMessageEvent = new CustomEvent('filehelper:message:add', {
        detail: { text: content }
      })

      window.dispatchEvent(newMessageEvent)
    }
  }

  // Vue app hook
  const appElement = document.querySelector("#app")
  const app = await appElement?.__vue_app__;

  if (appElement && app) {
    const store = await app.config.globalProperties.$store;
    // const chatState = await store.state.currentChatState;
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
  }
}

pageScript()
