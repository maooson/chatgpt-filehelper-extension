import { defaults } from 'lodash-es'
import Browser from 'webextension-polyfill'

export enum TriggerMode {
  Always = 'always',
  AtGPT = 'atGPT',
}

export const TRIGGER_MODE_TEXT = {
  [TriggerMode.Always]: { title: '始终触发', desc: '任意文本消息都会触发ChatGPT响应' },
  [TriggerMode.AtGPT]: { title: '命令触发', desc: '只有消息中包含"@gpt"关键字才会触发ChatGPT响应' },
}

export enum Language {
  Auto = 'auto',
  English = 'english',
  Chinese = 'chinese',
  Spanish = 'spanish',
  French = 'french',
  Korean = 'korean',
  Japanese = 'japanese',
  German = 'german',
  Portuguese = 'portuguese',
}

// 提问队列消息积压 n 条触发提醒
export enum QueueThreshold {
  T5 = 5,
  T10 = 10,
  T15 = 15,
  NONE = 999,
}

export const QUEUE_THRESHOLD_TEXT = {
  [QueueThreshold.T5]: { title: '5条', desc: '提问队列积压 5 条后触发告警（推荐设置）' },
  [QueueThreshold.T10]: { title: '10条', desc: '提问队列积压 10 条后触发告警' },
  [QueueThreshold.T15]: { title: '10条', desc: '提问队列积压 10 条后触发告警' },
  [QueueThreshold.NONE]: { title: '不限制', desc: '谨慎选择，建议告知用户当前的排队情况' },
}

// 单用户 10 分钟内提问次数限制
export enum GptRateLimit {
  R5 = 5,
  R10 = 10,
  R15 = 15,
  NONE = 999,
}

export const GPT_RATELIMIT_TEXT = {
  [GptRateLimit.R5]: { title: '5次', desc: '单用户 10 分钟可提问 5 次（推荐设置）' },
  [GptRateLimit.R10]: { title: '10次', desc: '单用户 10 分钟可提问 10 次' },
  [GptRateLimit.R15]: { title: '15次', desc: '单用户 10 分钟可提问 15 次' },
  [GptRateLimit.NONE]: { title: '不限制', desc: '谨慎选择，建议把提问机会留给更多人' },
}

const userConfigWithDefaultValue = {
  triggerMode: TriggerMode.AtGPT,
  language: Language.Auto,
  queueThreshold: QueueThreshold.T5,
  gptRateLimit: GptRateLimit.R5
}

export type UserConfig = typeof userConfigWithDefaultValue

export async function getUserConfig(): Promise<UserConfig> {
  const result = await Browser.storage.local.get(Object.keys(userConfigWithDefaultValue))
  return defaults(result, userConfigWithDefaultValue)
}

export async function updateUserConfig(updates: Partial<UserConfig>) {
  console.debug('update configs', updates)
  return Browser.storage.local.set(updates)
}

export enum ProviderType {
  ChatGPT = 'chatgpt',
  GPT3 = 'gpt3',
}

interface GPT3ProviderConfig {
  model: string
  apiKey: string
}

export interface ProviderConfigs {
  provider: ProviderType
  configs: {
    [ProviderType.GPT3]: GPT3ProviderConfig | undefined
  }
}

export async function getProviderConfigs(): Promise<ProviderConfigs> {
  const { provider = ProviderType.ChatGPT } = await Browser.storage.local.get('provider')
  const configKey = `provider:${ProviderType.GPT3}`
  const result = await Browser.storage.local.get(configKey)
  return {
    provider,
    configs: {
      [ProviderType.GPT3]: result[configKey],
    },
  }
}

export async function saveProviderConfigs(
  provider: ProviderType,
  configs: ProviderConfigs['configs'],
) {
  return Browser.storage.local.set({
    provider,
    [`provider:${ProviderType.GPT3}`]: configs[ProviderType.GPT3],
  })
}
