# ChatGPT English Typing Coach

A Chrome/Edge extension for learning English while chatting with ChatGPT.

The extension reads a Chinese draft from the ChatGPT input box, shows a suggested English version for typing practice, and lets you save useful words or phrases as local notes.

## Current Version

`v0.1.0`

This is an MVP prototype. Translation is currently mocked, so no external model API is required yet.

## Features

- Injects an `English Coach` panel into ChatGPT pages.
- Reads the current Chinese draft from the ChatGPT input box.
- Shows a mocked English suggestion.
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
  TESTING.md
```

## Roadmap

Next planned steps:

- Add an options page for API key, base URL, model name, and style preferences.
- Add a background service worker.
- Replace `mockTranslate()` with a real DeepSeek API call.
- Return structured translation results with suggested phrases.
- Auto-suggest useful words and phrases for notes.
- Add note search, export, and review features.

## Privacy

In `v0.1.0`, no external API is called. Notes are stored locally in the browser.

Future versions that connect to DeepSeek or another model provider should keep API keys in extension storage and must never commit real keys to the repository.
