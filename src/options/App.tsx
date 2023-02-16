import { CssBaseline, GeistProvider, Radio, Select, Text, Toggle, useToasts } from '@geist-ui/core'
import { capitalize } from 'lodash-es'
import { useCallback, useEffect, useState } from 'preact/hooks'
import '../base.css'
import {
  getUserConfig,
  Language,
  TriggerMode,
  TRIGGER_MODE_TEXT,
  updateUserConfig,
} from '../config'
import ProviderSelect from './ProviderSelect'

function OptionsPage() {
  const [triggerMode, setTriggerMode] = useState<TriggerMode>(TriggerMode.AtGPT)
  const [language, setLanguage] = useState<Language>(Language.Auto)
  const { setToast } = useToasts()

  useEffect(() => {
    getUserConfig().then((config) => {
      setTriggerMode(config.triggerMode)
      setLanguage(config.language)
    })
  }, [])

  const onTriggerModeChange = useCallback(
    (mode: TriggerMode) => {
      setTriggerMode(mode)
      updateUserConfig({ triggerMode: mode })
      setToast({ text: '触发模式切换成功', type: 'success' })
    },
    [setToast],
  )

  const onLanguageChange = useCallback(
    (language: Language) => {
      updateUserConfig({ language })
      setToast({ text: '语言切换成功', type: 'success' })
    },
    [setToast],
  )

  return (
    <div className="container w-[560px] min-h-screen mx-auto shadow-md shadow-gray-300">
      <div className="navbar w-auto py-0 bg-base-100">
        <div className="navbar-start">
          <div className="dropdown">
            <label tabIndex={0} className="btn btn-ghost">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h7" /></svg>
            </label>
            <ul tabIndex={0} className="menu menu-compact dropdown-content m-0 py-2 shadow bg-base-100 rounded-box w-48">
              <li><a href="https://aow.me" target="_blank">首页</a></li>
              <li><a href="https://chat.aoq.me" target="_blank">进入社区</a></li>
              <li><a href="https://weilaimeixue.notion.site/weilaimeixue/As-3bc4631f854e44d78825d4a4e73b2e02" target="_blank">了解更多</a></li>
            </ul>
          </div>
        </div>
        <div className="navbar-center">
          <a className="normal-case text-xl">ChatGPT for Wechat</a>
        </div>
        <div className="navbar-end">
          <span className="badge">文件传输助手版</span>
        </div>
      </div>
      <div className="hero bg-gradient-to-b from-purple-500 to-pink-500">
        <div className="hero-overlay bg-opacity-60"></div>
        <div className="hero-content text-center text-neutral-content">
          <div className="max-w-md">
            <p className="mb-5 text-base">开发不易，请我喝杯咖啡吧，感谢您的支持！</p>
            <img className="w-48 h-48" src={"https://models.aoq.me/zansm.jpg"} alt="赞赏码" />
          </div>
        </div>
      </div>
      <main className="mx-auto mx-4">
        <div className="flex flex-col w-full">
          <div className="grid card mt-4">
            <h3 className="text-lg">触发模式</h3>
            <Radio.Group
              value={triggerMode}
              onChange={(val) => onTriggerModeChange(val as TriggerMode)}
              disabled
            >
              {Object.entries(TRIGGER_MODE_TEXT).map(([value, texts]) => {
                return (
                  <Radio key={value} value={value} className="radio radio-primary">
                    {texts.title}
                    <Radio.Description>{texts.desc}</Radio.Description>
                  </Radio>
                )
              })}
            </Radio.Group>
          </div>
          <div className="grid card mt-4">
            <h3 className="text-lg">选择语言</h3>
            <Text className="my-1">
              ChatGPT响应中使用的语言，推荐使用<span className="italic">auto</span>
            </Text>
            <Select
              className="w-full max-w-xs"
              value={language}
              placeholder="选择语言"
              onChange={(val) => onLanguageChange(val as Language)}
            >
              {Object.entries(Language).map(([k, v]) => (
                <Select.Option key={k} value={v}>
                  {capitalize(v)}
                </Select.Option>
              ))}
            </Select>
          </div>
          <div className="grid card mt-4">
            <h3 className="text-lg">选择AI源</h3>
            <ProviderSelect />
          </div>
          <div className="grid card my-4">
            <h3 className="text-lg">其他设置</h3>
            <div className="flex flex-row gap-4">
              <Toggle initialChecked disabled />
              <Text span margin={0}>
                自动删除文件传输助手中触发的chatgpt对话
              </Text>
            </div>
          </div>
        </div>
      </main>
      <footer className="footer w-auto p-4 bg-neutral text-neutral-content">
        <div className="w-full place-items-center">
          <span className="footer-title">POWERED BY AOW.ME</span>
        </div>
      </footer>
    </div>
  )
}

function App() {

  return (
    <GeistProvider>
      <CssBaseline />
      <OptionsPage />
    </GeistProvider>
  )
}

export default App
