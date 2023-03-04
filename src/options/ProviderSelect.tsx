import { Button, Input, Textarea, Spinner, Tabs, useInput, useToasts } from '@geist-ui/core'
import { FC, useCallback, useState } from 'react'
import useSWR from 'swr'
import { ConfigResponse, ModelResponse, fetchConfig, fetchModel, fetchPromotion } from '../api'
import { getProviderConfigs, ProviderConfigs, ProviderType, saveProviderConfigs } from '../config'

interface ConfigProps {
  config: ProviderConfigs
  extConfig: ConfigResponse
}

interface ChildComponentProps {
  enabled: Boolean
  defaultSystemMessage?: string
  systemMessageBindings?: any
}

const GetAPIKeyComponent: FC<ChildComponentProps> = ({ enabled }) => {
  if (!enabled) return null;

  return (
    <span className="italic text-xs mt-2">
      如果没有 OpenAI 的API Key，请通过微信联系As: Asgrief
    </span>
  );
}

const SystemMessageComponent: FC<ChildComponentProps> = ({ enabled, defaultSystemMessage, systemMessageBindings }) => {
  if (!enabled) return null;

  return (
    <div className="flex flex-col gap-2 mt-4">
      <span>
        通过系统消息来设定这个Bot的会话行为
      </span>
      <div className="flex flex-col gap-2">
        <Textarea
          style={{ width: '100%' }}
          auto
          placeholder={defaultSystemMessage}
          {...systemMessageBindings}
        />
      </div>
      <span className="italic text-xs">
        了解更多有关gpt-3.5-turbo的介绍，请点击{' '}
        <a href="https://platform.openai.com/docs/guides/chat/introduction" target="_blank" rel="noreferrer">此处</a>
      </span>
    </div>
  )
}

const ConfigPanel: FC<ConfigProps> = ({ config, extConfig }) => {
  const [tab, setTab] = useState<ProviderType>(config.provider)
  const { bindings: apiKeyBindings } = useInput(config.configs[ProviderType.ChatGPTAPI]?.apiKey ?? '')
  const { bindings: systemMessageBindings } = useInput(config.configs[ProviderType.ChatGPTAPI]?.systemMessage ?? '')
  const [model, setModel] = useState(config.configs[ProviderType.ChatGPTAPI]?.model ?? extConfig.models.chatgpt_api_model_name)
  const { setToast } = useToasts()

  const save = useCallback(async () => {
    if (tab === ProviderType.ChatGPTAPI) {
      if (!apiKeyBindings.value) {
        alert('请输入OpenAI API key')
        return
      }
    }
    await saveProviderConfigs(tab, {
      [ProviderType.ChatGPTAPI]: {
        model,
        apiKey: apiKeyBindings.value,
        systemMessage: systemMessageBindings.value,
      },
    })
    setToast({ text: 'AI源切换成功', type: 'success' })
  }, [apiKeyBindings.value, systemMessageBindings.value, setToast, tab])

  return (
    <div className="flex flex-col gap-2">
      <Tabs align="center" leftSpace={0} style={{ display: "block" }} value={tab} onChange={(v) => setTab(v as ProviderType)}>
        <Tabs.Item label="ChatGPT 网页端" value={ProviderType.ChatGPTWeb}>
          通过ChatGPT网页端接入<span className="text-green-500">免费</span>，推荐使用PLUS
        </Tabs.Item>
        <Tabs.Item label="ChatGPT API" value={ProviderType.ChatGPTAPI}>
          <div className="flex flex-col gap-2">
            <span>
              通过OpenAI官方API接入，比较稳定{' '}
              <span className="font-semibold">需要按需付费</span>
            </span>
            <div className="flex flex-col gap-2">
              <Input className="!w-full" htmlType="password" label="API key" {...apiKeyBindings} />
            </div>
            <span className="italic text-xs">
              如何获取或创建你的 OpenAI API Key，请点击{' '}
              <a href="https://platform.openai.com/account/api-keys" target="_blank" rel="noreferrer">此处</a>
            </span>
            <GetAPIKeyComponent enabled={extConfig.features.getApiKey} />
          </div>
          <SystemMessageComponent
            enabled={extConfig.features.systemMessage}
            defaultSystemMessage={extConfig.templates.systemMessageTemplate}
            systemMessageBindings={systemMessageBindings} />
        </Tabs.Item>
      </Tabs>
      <Button scale={2 / 3} ghost auto type="success-light" onClick={save}>
        保存
      </Button>
    </div>
  )
}

const ProviderSelect: FC<ConfigProps> = ({ extConfig }) => {
  const query = useSWR('provider-configs', async () => {
    const [config] = await Promise.all([
      getProviderConfigs(),
      fetchConfig(),
    ])
    return { config }
  })
  if (query.isLoading) {
    return <Spinner />
  }
  return <ConfigPanel
    config={query.data!.config}
    extConfig={extConfig} />
}

export default ProviderSelect
