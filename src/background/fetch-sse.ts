import { createParser } from 'eventsource-parser'

import { streamAsyncIterable } from './stream-async-iterable'
import * as types from './types'

export async function fetchSSE(
  url: string,
  options: RequestInit & { onMessage: (message: string) => void },
) {
  const { onMessage, ...fetchOptions } = options
  const res = await fetch(url, fetchOptions)
  if (!res.ok) {
    const msg = `ChatGPT error ${res.status || res.statusText}`
    const error = new types.ChatGPTError(msg)
    error.statusCode = res.status
    error.statusText = res.statusText
    error.response = res
    throw error
  }

  const parser = createParser((event) => {
    if (event.type === 'event') {
      onMessage(event.data)
    }
  })

  for await (const chunk of streamAsyncIterable(res.body!)) {
    const str = new TextDecoder().decode(chunk)
    parser.feed(str)
  }
}
