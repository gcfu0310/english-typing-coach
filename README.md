# ChatGPT English Typing Coach

A Chrome/Edge extension for learning English while chatting with ChatGPT.

The extension reads a Chinese draft from the ChatGPT input box, shows a suggested English version for typing practice, and lets you save useful words or phrases as local notes.

## Current Version

`v0.2.0`

This is still an early prototype. It can call DeepSeek for real translation after you configure an API key. If the API key is missing or the request fails, the content panel falls back to mock translation so the local workflow remains testable.

## Features

- Injects an `English Coach` panel into ChatGPT pages.
- Reads the current Chinese draft from the ChatGPT input box.
- Shows a DeepSeek English suggestion when configured.
- Falls back to a mocked English suggestion when model access is unavailable.
- Shows suggested words or phrases returned by the model.
- Copies the English suggestion.
- Inserts the English suggestion back into the ChatGPT input box.
- Saves words or phrases with meanings as notes.
- Stores notes locally with `chrome.storage.local`.
- Provides a popup notes page for viewing and deleting saved notes.

## Install Locally

1. Open Chrome or Edge.
2. Go to `chrome://extensions/` or `edge://extensions/`.
3. Enable `Developer mode`.
4. Click `Load unpacked`.
5. Select this folder:

```text
english-typing-coach
```

6. Open `https://chatgpt.com/`.
7. Type a Chinese draft in the ChatGPT input box.
8. Use the `English Coach` panel in the bottom-right corner.

## Manual Test Flow

Use this Chinese draft:

```text
我想先确认一下这个设计是否合理
```

Click `Translate`.

Expected mocked English:

```text
I want to check whether this design makes sense.
```

Then test:

- `Copy English`
- `Insert English`
- `Add Note`
- Popup note view
- Popup note delete

See [TESTING.md](TESTING.md) for the full test checklist.

## Project Structure

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

## DeepSeek Setup

1. Load the extension locally.
2. Click the extension icon.
3. Click `Options`.
4. Enter your DeepSeek API key.
5. Keep the default base URL unless DeepSeek changes it:

```text
https://api.deepseek.com
```

6. Choose a model:

```text
deepseek-v4-flash
```

or:

```text
deepseek-v4-pro
```

7. Save settings.

The extension sends translation requests from `background.js` to:

```text
/chat/completions
```

## Roadmap

Next planned steps:

- Improve error handling and loading states.
- Add a safe test button on the options page.
- Improve phrase extraction and note creation.
- Add note search, export, and review features.

## Privacy

Notes and settings are stored locally in the browser.

When DeepSeek is configured, Chinese drafts are sent to the configured model provider for translation. Never commit real API keys to the repository.
