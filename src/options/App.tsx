import { CssBaseline, GeistProvider, Radio, Select, Text, useToasts } from '@geist-ui/core'
import { capitalize } from 'lodash-es'
import { FC, useCallback, useEffect, useState } from 'react'
import '../base.css'
import {
  getUserConfig,
  GptRateLimit,
  GPT_RATELIMIT_TEXT,
  Language,
  QueueThreshold,
  QUEUE_THRESHOLD_TEXT,
  TriggerMode,
  TRIGGER_MODE_TEXT,
  updateUserConfig,
  getProviderConfigs,
  ProviderConfigs,
  UserConfig,
} from '../config'
import ProviderSelect from './ProviderSelect'
import { ConfigResponse, fetchConfig } from '../api'
import { PromotionComponent } from '../components/Promotion'

export type FeatureProps = {
  userConfig?: UserConfig,
  extConfig?: ConfigResponse
}

const GptRateLimitComponent: FC<FeatureProps> = ({ userConfig, extConfig }) => {
  const [gptRateLimit, setGptRateLimit] = useState<GptRateLimit>(GptRateLimit.NONE)
  const [enabled, setEnabled] = useState<Boolean>(false)
  const { setToast } = useToasts()

  useEffect(() => {
    setGptRateLimit(userConfig?.gptRateLimit || GptRateLimit.NONE)
    setEnabled(extConfig?.features.gptRateLimit || false)
  }, [])

  const onGptRateLimitChange = useCallback(
    (gptRateLimit: GptRateLimit) => {
      setGptRateLimit(gptRateLimit)
      updateUserConfig({ gptRateLimit })
      setToast({ text: '设置单用户提问次数成功', type: 'success' })
    },
    [setToast],
  )

  if (!enabled) {
    return null
  }

  return (
    <div className="grid mt-4">
      <h3 className="text-lg">单用户提问频率</h3>
      <Text className="my-1">
        设置单个用户在 10 分钟内提问的次数
      </Text>
      <Radio.Group
        value={gptRateLimit}
        onChange={(val) => onGptRateLimitChange(val as GptRateLimit)}
      >
        {Object.entries(GPT_RATELIMIT_TEXT).map(([value, texts]) => (
          <Radio key={value} value={value} className="radio radio-primary">
            {texts.title}
            <Radio.Description>{texts.desc}</Radio.Description>
          </Radio>
        ))}
      </Radio.Group>
    </div>
  )
}

const QueueThresholdComponent: FC<FeatureProps> = ({ userConfig, extConfig }) => {
  const [queueThreshold, setQueueThreshold] = useState<QueueThreshold>(QueueThreshold.T5)
  const [enabled, setEnabled] = useState<Boolean>(false)
  const { setToast } = useToasts()

  useEffect(() => {
    setQueueThreshold(userConfig?.queueThreshold || QueueThreshold.T5)
    setEnabled(extConfig?.features.queueThreshold || false)
  }, [userConfig, extConfig])

  const onQueueThresholdChange = useCallback(
    (queueThreshold: QueueThreshold) => {
      setQueueThreshold(queueThreshold)
      updateUserConfig({ queueThreshold })
      setToast({ text: '设置队列告警阈值成功', type: 'success' })
    },
    [setToast],
  )

  if (!enabled) {
    return null
  }

  return (
    <div className="grid mt-4">
      <h3 className="text-lg">队列积压告警阈值</h3>
      <Text className="my-1">用户同时提问消息会进入队列，超过阈值触发告警提醒</Text>
      <Radio.Group
        value={queueThreshold}
        onChange={(val) => onQueueThresholdChange(val as QueueThreshold)}
      >
        {Object.entries(QUEUE_THRESHOLD_TEXT).map(([value, texts]) => (
          <Radio key={value} value={value} className="radio radio-primary">
            {texts.title}
            <Radio.Description>{texts.desc}</Radio.Description>
          </Radio>
        ))}
      </Radio.Group>
    </div>
  )
}

function OptionsPage() {
  const [triggerMode, setTriggerMode] = useState<TriggerMode>(TriggerMode.AtGPT)
  const [language, setLanguage] = useState<Language>(Language.Auto)
  const [userConfig, setUserConfig] = useState<UserConfig>()
  const [providerConfig, setProviderConfig] = useState<ProviderConfigs>()
  const [extConfig, setExtConfig] = useState<ConfigResponse>()
  const { setToast } = useToasts()

  useEffect(() => {
    getUserConfig().then((config) => {
      setTriggerMode(config.triggerMode)
      setLanguage(config.language)
      setUserConfig(config)
    })

    getProviderConfigs().then((providerConfig) => {
      setProviderConfig(providerConfig)
    })

    fetchConfig().then((extConfig) => {
      setExtConfig(extConfig)
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
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-5 w-5"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M4 6h16M4 12h16M4 18h7"
                />
              </svg>
            </label>
            <ul tabIndex={0} className="menu menu-compact dropdown-content m-0 py-2 shadow bg-base-100 rounded-box w-48">
              <li>
                <a href="https://aow.me" target="_blank">首页</a>
              </li>
              <li>
                <a href="https://chat.aoq.me" target="_blank">进入社区</a>
              </li>
              <li>
                <a href="https://weilaimeixue.notion.site/weilaimeixue/As-3bc4631f854e44d78825d4a4e73b2e02" target="_blank">了解更多</a>
              </li>
            </ul>
          </div>
        </div>
        <div className="navbar-center">
          <a className="normal-case text-xl">ChatGPT for Wechat</a>
        </div>
        <div className="navbar-end">
          <a href="https://filehelper.weixin.qq.com" target="_blank">
            <span className="badge">文件传输助手版</span>
          </a>
        </div>
      </div>
      <PromotionComponent enabled={extConfig?.features.hasPromotion} data={extConfig?.promotion} />
      <main className="mx-4 pb-4">
        <div className="flex flex-col w-full">
          <div className="grid mt-4 !hidden">
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
          <div className="grid mt-4">
            <h3 className="text-lg">选择AI源</h3>
            <ProviderSelect extConfig={extConfig} />
          </div>
          <div className="grid mt-4">
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
          <GptRateLimitComponent extConfig={extConfig} userConfig={userConfig} />
          <QueueThresholdComponent extConfig={extConfig} userConfig={userConfig} />
        </div>
      </main>
      <footer className="footer sticky bottom-0 left-0 right-0 w-auto p-4 bg-neutral text-white">
        <div className="w-full place-items-center">
          <span className="footer-title mt-2">
            &copy; 2023{' '}
            <a className="text-white" href="https://aow.me" target="_blank">
              aow.me
            </a>{' '}
            版权所有
          </span>
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