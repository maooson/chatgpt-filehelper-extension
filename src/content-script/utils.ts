export function withCommandSatisfied(content: string, botNickName: string) {
  if (!botNickName) {
    return false
  }

  const isAtChatGPTBot = `@${botNickName}`

  if (content.indexOf(isAtChatGPTBot) < 0) {
    return false
  }

  return true
}

export function stripHTMLTags(html: string) {
  // 使用正则表达式匹配HTML标签
  const regex = /<[^>]+>/g;
  // 用空字符串替换所有匹配的标签
  return html.replace(regex, '');
}

export function withContentLengthSatisfied(content: string) {
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
