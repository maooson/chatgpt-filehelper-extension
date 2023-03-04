import { Button, Input, Textarea, Spinner, Tabs, useInput, useToasts } from '@geist-ui/core'
import { FC, useCallback, useState } from 'react'
import useSWR from 'swr'
import { fetchExtensionConfigs } from '../api'
import { getProviderConfigs, ProviderConfigs, ProviderType, saveProviderConfigs } from '../config'

interface ConfigProps {
  config: ProviderConfigs
  models: string[]
}

async function loadModels(): Promise<string[]> {
  const configs = await fetchExtensionConfigs()
  return configs.openai_model_names
}

const ConfigPanel: FC<ConfigProps> = ({ config, models }) => {
  const [tab, setTab] = useState<ProviderType>(config.provider)
  const { bindings: apiKeyBindings } = useInput(config.configs[ProviderType.GPT3]?.apiKey ?? '')
  const { bindings: systemMessageBindings } = useInput(config.configs[ProviderType.ChatGPTAPI]?.systemMessage ?? '')
  const [model, setModel] = useState(config.configs[ProviderType.GPT3]?.model ?? models[0])
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
        <Tabs.Item  label="ChatGPT网页端" value={ProviderType.ChatGPTWeb}>
          通过ChatGPT网页端接入，免费，但接口不够稳定
        </Tabs.Item>
        <Tabs.Item label="ChatGPT API" value={ProviderType.ChatGPTAPI}>
          <div className="flex flex-col gap-2">
            <span>
              通过ChatGPT API接入，比较稳定{' '}
              <span className="font-semibold">需要按需付费</span>
            </span>
            <div className="flex flex-col gap-2">
              <Input
                className="!w-full"
                auto
                htmlType="password"
                label="API key"
                {...apiKeyBindings}
              />
            </div>
            <span className="italic text-xs">
              如何获取或创建你的ChatGPT API Key，请点击{' '}
              <a
                href="https://platform.openai.com/account/api-keys"
                target="_blank"
                rel="noreferrer"
              >
                此处
              </a>
            </span>
          </div>
          <div className="flex flex-col gap-2 mt-4">
            <span>
              通过系统消息来设定这个Bot的会话行为
            </span>
            <div className="flex flex-col gap-2">
              <Textarea
                style={{ width: '100%' }}
                auto
                placeholder="现在你是一个在微信群的AI助手，你的名字是ChatGirl，由AOW.ME开发"
                {...systemMessageBindings}
              />
            </div>
            <span className="italic text-xs">
              了解更多有关gpt-3.5-turbo的介绍，请点击{' '}
              <a
                href="https://platform.openai.com/docs/guides/chat/introduction"
                target="_blank"
                rel="noreferrer"
              >
                此处
              </a>
            </span>
          </div>
        </Tabs.Item>
      </Tabs>
      <Button scale={2 / 3} ghost auto type="success-light" onClick={save}>
        保存
      </Button>
    </div>
  )
}

function ProviderSelect() {
  const query = useSWR('provider-configs', async () => {
    const [config, models] = await Promise.all([getProviderConfigs(), loadModels()])
    return { config, models }
  })
  if (query.isLoading) {
    return <Spinner />
  }
  return <ConfigPanel config={query.data!.config} models={query.data!.models} />
}

export default ProviderSelect
