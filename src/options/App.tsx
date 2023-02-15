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
      <div className="hero" style={{ backgroundImage: `url("https://1secondpainting.com/optimized_background.jpg")` }}>
        <div className="hero-overlay bg-opacity-60"></div>
        <div className="hero-content text-center text-neutral-content">
          <div className="max-w-md">
            <p className="mb-5 text-base">如果你觉得此插件对你有用，可以扫描下方二维码支持我</p>
            <img className="w-36 h-36" src={"data:image/png;base64,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"} alt="赞赏码" />
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
