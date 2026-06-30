# ChatGPT English Typing Coach

简体中文 | [English](README.md)

一个用于在 ChatGPT 对话过程中学习英语的 Chrome/Edge 浏览器扩展。

这个扩展会读取 ChatGPT 输入框里的中文草稿，生成一版英文表达，供你通过“照着敲”的方式练习英语。同时，你可以把有用的单词或短语保存成本地笔记。

## 当前版本

`v0.2.0`

这是一个早期原型版本。配置 DeepSeek API Key 后，它可以调用 DeepSeek 进行真实翻译。如果没有配置 API Key，或者请求失败，插件会自动回退到 mock 翻译，方便继续测试本地流程。

## 功能

- 在 ChatGPT 页面注入 `English Coach` 面板。
- 读取 ChatGPT 输入框中的中文草稿。
- 配置 DeepSeek 后，生成真实英文建议。
- 模型不可用时，自动回退到 mock 英文建议。
- 展示模型返回的推荐单词或短语。
- 复制英文建议。
- 将英文建议插入回 ChatGPT 输入框。
- 保存单词或短语及其中文意思。
- 使用 `chrome.storage.local` 在浏览器本地保存笔记。
- 提供 popup 生词本页面，用于查看和删除笔记。

## 本地安装

1. 打开 Chrome 或 Edge。
2. 进入 `chrome://extensions/` 或 `edge://extensions/`。
3. 打开 `Developer mode` / `开发者模式`。
4. 点击 `Load unpacked` / `加载已解压的扩展程序`。
5. 选择这个文件夹：

```text
english-typing-coach
```

6. 打开 `https://chatgpt.com/`。
7. 在 ChatGPT 输入框里输入中文草稿。
8. 使用右下角的 `English Coach` 面板。

## 手动测试流程

使用这句中文草稿：

```text
我想先确认一下这个设计是否合理
```

点击 `Translate`。

如果没有配置 DeepSeek，预期 mock 英文是：

```text
I want to check whether this design makes sense.
```

然后测试：

- `Copy English`
- `Insert English`
- `Add Note`
- popup 查看笔记
- popup 删除笔记

完整测试清单见 [TESTING.md](TESTING.md)。

## 项目结构

```text
english-typing-coach/
  manifest.json
  content.js
  content.css
  popup.html
  popup.js
  popup.css
  options.html
  options.js
  options.css
  background.js
  TESTING.md
```

## DeepSeek 配置

1. 本地加载扩展。
2. 点击浏览器工具栏里的扩展图标。
3. 点击 `Options`。
4. 填写你的 DeepSeek API Key。
5. 如果 DeepSeek 官方没有变更，Base URL 保持默认：

```text
https://api.deepseek.com
```

6. 选择模型：

```text
deepseek-v4-flash
```

或者：

```text
deepseek-v4-pro
```

7. 点击保存。

扩展会通过 `background.js` 向下面这个接口发送翻译请求：

```text
/chat/completions
```

## 后续计划

接下来计划做：

- 改进错误提示和加载状态。
- 在 options 页面增加安全的连接测试按钮。
- 改进短语提取和笔记创建体验。
- 增加笔记搜索、导出和复习功能。

## 隐私说明

笔记和设置保存在浏览器本地。

配置 DeepSeek 后，中文草稿会发送到你配置的模型服务商用于翻译。不要把真实 API Key 提交到 GitHub 仓库。
