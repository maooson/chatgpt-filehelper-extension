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

<https://chrome.google.com/webstore/detail/chatgpt-for-wechat/cdlangplaophialnpfbdfndiobanklfd>

#### Local Install

1. Download `chromium.zip` from [Releases](https://github.com/maooson/chatgpt-wechat-extension/releases).
2. Unzip the file.
3. In Chrome/Edge go to the extensions page (`chrome://extensions` or `edge://extensions`).
4. Enable Developer Mode.
5. Drag the unzipped folder anywhere on the page to import it (do not delete the folder afterwards).

### Install to Firefox

#### Install from Mozilla Add-on Store (Preferred)

<https://addons.mozilla.org/addon/chatgpt-for-google/>

#### Local Install

1. Download `firefox.zip` from [Releases](https://github.com/maooson/chatgpt-wechat-extension/releases).
2. Unzip the file.
3. Go to `about:debugging`, click "This Firefox" on the sidebar.
4. Click "Load Temporary Add-on" button, then select any file in the unzipped folder.

## Build from source

1. Clone the repo
2. Install dependencies with `npm`
3. `npm run build`
4. Load `build/chromium/` or `build/firefox/` directory to your browser

## Credit

This project is inspired by [ZohaibAhmed/ChatGPT-Google](https://github.com/ZohaibAhmed/ChatGPT-Google)
