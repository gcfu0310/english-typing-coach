# Changelog

## v0.2.0 - 2026-06-30

### Added

- Options page for DeepSeek API key, base URL, model, and translation style.
- Background service worker for model requests.
- DeepSeek-compatible `/chat/completions` translation flow.
- Structured translation response with suggested phrases.
- Clickable phrase suggestions that fill the note form.
- Popup `Options` shortcut.

### Changed

- `Translate` now tries DeepSeek first and falls back to mock translation when configuration or API access is unavailable.

## v0.1.0 - 2026-06-30

Initial MVP prototype.

### Added

- Chrome/Edge Manifest V3 extension structure.
- ChatGPT content script injection for `chatgpt.com` and `chat.openai.com`.
- Floating `English Coach` panel.
- Chinese draft reading from the ChatGPT input box.
- Mock translation flow.
- `Copy English` and `Insert English` actions.
- Word/phrase note form.
- Local note storage with `chrome.storage.local`.
- Popup notes page.
- Note deletion from popup.
- Manual testing guide.

### Not Yet Implemented

- Real DeepSeek API translation.
- Options page.
- Background service worker.
- Structured phrase suggestions.
- Search, export, or review for saved notes.
