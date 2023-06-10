# ChatGPT for Weixin FileHelper

A browser extension to automatically respond to WeChat messages via chatgpt, supports Chrome/Edge/Firefox

## Requirements

1. Your WeChat account needs to support web-based login.
2. Open both the WeChat web page and the https://chat.openai.com/chat page after installing the extension.

## Screenshot

![Screenshot 01](screenshot_1.jpg?raw=true)
![Screenshot 02](screenshot_2.jpg?raw=true)

## Installation

### Install to Chrome/Edge

#### Install from Chrome Web Store (Preferred)

<[https://chrome.google.com/webstore/detail/chatgpt-for-wechat/cdlangplaophialnpfbdfndiobanklfd](https://chrome.google.com/webstore/detail/chatgpt-for-wechat%EF%BC%88%E4%B8%AA%E4%BA%BA%E5%8A%A9%E6%89%8B%E7%89%88%EF%BC%89/lkopaebiifjbologkhialmbjnmalepck)>

#### Local Install

1. Download `chromium.zip` from [Releases](https://aow.me/wjcszs_offline).
2. Unzip the file.
3. In Chrome/Edge go to the extensions page (`chrome://extensions` or `edge://extensions`).
4. Enable Developer Mode.
5. Drag the unzipped folder anywhere on the page to import it (do not delete the folder afterwards).

## Build from source

1. Clone the repo
2. Install dependencies with `npm`
3. `npm run build`
4. Load `build/chromium/` or `build/firefox/` directory to your browser
