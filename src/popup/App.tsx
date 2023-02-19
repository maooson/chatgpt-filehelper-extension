import { GlobeIcon, GearIcon, CheckCircleFillIcon } from '@primer/octicons-react'
import { useCallback } from 'react'
import useSWR from 'swr'
import Browser from 'webextension-polyfill'
import '../base.css'
import logo from '../logo.png'

function App() {
  const accessTokenQuery = useSWR(
    'accessToken',
    () => Browser.runtime.sendMessage({ type: 'GET_ACCESS_TOKEN' }),
    { shouldRetryOnError: false },
  )

  const openOptionsPage = useCallback(() => {
    Browser.runtime.sendMessage({ type: 'OPEN_OPTIONS_PAGE' })
  }, [])

  return (
    <div className="flex flex-col h-full">
      <div className="mb-2 flex flex-row items-center px-1">
        <img src={logo} className="w-5 h-5 rounded-sm" />
        <p className="text-sm font-semibold m-0 ml-1">ChatGPT for Wechat</p>
        <div className="grow"></div>
        <span className="cursor-pointer leading-[0]" onClick={openOptionsPage}>
          <GearIcon size={16} />
        </span>
      </div>
      <div className="hero bg-gradient-to-b from-purple-500 to-pink-500">
        <div className="hero-overlay bg-opacity-60"></div>
        <div className="hero-content text-center text-neutral-content">
          <div className="max-w-md">
            <p className="mb-5 text-base">开发不易，请我喝杯咖啡吧，感谢您的支持！</p>
            <img className="w-48 h-48" src={'https://models.aoq.me/zansm.jpg'} alt="赞赏码" />
          </div>
        </div>
      </div>
      {(() => {
        if (accessTokenQuery.isLoading) {
          return (
            <div className="grow justify-center items-center flex animate-bounce">
              <GlobeIcon size={24} />
            </div>
          )
        }
        if (accessTokenQuery.data) {
          return (
            <div className="grow justify-center items-center flex flex-col">
              <p className="text-base text-center">
                ChatGPT 登录状态正常<br />
                <CheckCircleFillIcon className="mt-4 fill-green-500" size={48} />
              </p>
              <iframe src="https://chat.openai.com/chat" className="w-0 h-0 grow-0 border-none" />
            </div>
          )
        }
        return (
          <div className="grow flex flex-col">
            <div className="grid place-items-center">
              <p className="text-base text-center">请检查 ChatGPT 页面是否已登录 {' '}
                <a href="https://chat.openai.com" target="_blank" rel="noreferrer">
                  chat.openai.com
                </a><br />
                若已经登录，请尝试再次点击插件图标或关闭代理
              </p>
            </div>
            <div className="divider my-0 text-base">或</div>
            <div className="grid place-items-center">
              <p className="text-base">打开 <span className="cursor-pointer leading-[0]" onClick={openOptionsPage}>
                <GearIcon className="mr-2" size={16} />插件配置页面</span>，切换 AI 源</p>
            </div>
          </div>
        )
      })()}
      <footer className="footer sticky bottom-0 left-0 right-0 w-auto p-4 bg-neutral text-white">
        <div className="w-full place-items-center">
          <span className="footer-title mt-2">
            &copy; 2023{' '}
            <a className="text-white" href="https://aow.me" target="_blank" rel="noreferrer">
              aow.me
            </a>{' '}
            版权所有 <a className="text-white" href="https://aow.me/disclaimer" target="_blank">免责声明</a>
          </span>
        </div>
      </footer>
    </div>
  )
}

export default App
