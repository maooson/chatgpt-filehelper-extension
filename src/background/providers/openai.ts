import { fetchSSE } from '../fetch-sse'
import { GptResponse, Provider, RequestParams } from '../types'

export class OpenAIProvider implements Provider {
  constructor(private apiKey: string, private model: string) {
    this.apiKey = apiKey
    this.model = model
  }

  private buildPrompt(prompt: string): string {
    if (this.model.startsWith('text-chat-davinci')) {
      return `Respond conversationally.<|im_end|>\n\nUser: ${prompt}<|im_sep|>\nChatGPT:`
    }
    return prompt
  }

  async callGPT(params: RequestParams) {
    const result: GptResponse = {
      completion: '',
    }

    await fetchSSE('https://api.openai.com/v1/completions', {
      method: 'POST',
      signal: params.signal,
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${this.apiKey}`,
      },
      body: JSON.stringify({
        model: this.model,
        prompt: this.buildPrompt(params.request.prompt),
        stream: true,
        max_tokens: 2048,
        temperature: 0.9,
        top_p: 1,
        frequency_penalty: 0.0,
        presence_penalty: 0.6,
      }),
      onMessage(message) {
        console.debug('sse message', message)
        if (message === '[DONE]') {
          params.onEvent(result)
          return
        }
        let data
        try {
          data = JSON.parse(message)
          const token = data.choices[0].text
          if (token === '<|im_end|>' || token === '<|im_sep|>') {
            return
          }
          result.completion += token
          result.messageId = data.id
          result.conversationId = params.request.conversationId
        } catch (err) {
          // console.error(err)
          return
        }
      },
    })
    return {}
  }
}
