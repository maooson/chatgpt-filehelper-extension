export function withOptionsSatisfied(content: string, botNickName: string) {
  if (!botNickName) {
    return false
  }

  const isAtChatGPTBot = `@${botNickName}`

  if (content.indexOf(isAtChatGPTBot) < 0) {
    return false
  }

  content = content.replaceAll(isAtChatGPTBot, '').trim()
  if (content.length < 2) {
    return false
  }

  return true
}

export function withUserNameSatisfied(username: string) {
  if (username && username.length > 1 && username[0] === '@') {
    return true
  }

  return false
}
