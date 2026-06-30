# Testing Guide

This guide explains how to test the current MVP manually.

## 1. Static Checks

Run these commands from the workspace root:

```powershell
C:\Users\fgc\.cache\codex-runtimes\codex-primary-runtime\dependencies\node\bin\node.exe --check english-typing-coach\content.js
C:\Users\fgc\.cache\codex-runtimes\codex-primary-runtime\dependencies\node\bin\node.exe --check english-typing-coach\popup.js
C:\Users\fgc\.cache\codex-runtimes\codex-primary-runtime\dependencies\node\bin\node.exe --check english-typing-coach\background.js
C:\Users\fgc\.cache\codex-runtimes\codex-primary-runtime\dependencies\node\bin\node.exe --check english-typing-coach\options.js
Get-Content english-typing-coach\manifest.json | ConvertFrom-Json
```

Expected result:

- `content.js`, `popup.js`, `background.js`, and `options.js` print no errors.
- `manifest.json` parses successfully.

## 2. Local Test Page

Open this file in Chrome or Edge:

```text
C:\Users\fgc\Documents\Codex\2026-06-30\wo-x\work\content-script-test-page.html
```

Expected result:

1. A mock ChatGPT input page appears.
2. The `English Coach` panel appears in the bottom-right corner.
3. Click `Translate`.
4. Because the local test page is not running as a real extension, it falls back to mock translation.
5. The `Suggested English` area shows:

```text
I want to check whether this design makes sense.
```

6. Click `Insert English`.
7. The mock input box changes to:

```text
I want to check whether this design makes sense.
```

8. Click the suggested `make sense` phrase or enter a note manually:

```text
Word / Phrase: make sense
Meaning: reasonable; logical
```

9. Click `Add Note`.
10. The status line shows:

```text
Note saved.
```

On the local test page, notes are saved in `localStorage` under the key
`englishTypingCoachNotes`. In the real extension, notes are saved in
`chrome.storage.local`.

## 3. Load As Browser Extension

Use Chrome or Edge:

1. Open `chrome://extensions/` or `edge://extensions/`.
2. Turn on `Developer mode`.
3. Click `Load unpacked`.
4. Select:

```text
C:\Users\fgc\Documents\Codex\2026-06-30\wo-x\english-typing-coach
```

5. Open `https://chatgpt.com/`.
6. Type a Chinese draft into the ChatGPT input box.
7. Confirm the `English Coach` panel appears.
8. Click `Translate`.
9. Confirm the English suggestion appears.
10. Click `Copy English` or `Insert English`.
11. Add a word or phrase in the note form.
12. Confirm the status line says `Note saved.`
13. Click the extension icon in the browser toolbar.
14. Confirm the popup shows the saved note.
15. Click `Delete`.
16. Confirm the note is removed from the popup.

## 4. DeepSeek Translation Test

1. Click the extension icon.
2. Click `Options`.
3. Enter a DeepSeek API key.
4. Keep the default base URL:

```text
https://api.deepseek.com
```

5. Choose `deepseek-v4-flash`.
6. Click `Save Settings`.
7. Open `https://chatgpt.com/`.
8. Type a Chinese draft.
9. Click `Translate`.
10. Confirm the status line says `DeepSeek translation ready.`
11. Confirm the phrase suggestions appear when the model returns phrases.

If the API key is missing or the request fails, the status line starts with `Using mock translation:`.

## 5. Current Known Limitations

- The input-box detection is based on common selectors and may need adjustment if ChatGPT changes its DOM.
- `Insert English` replaces the current draft instead of preserving the Chinese version.
- The popup can view and delete notes, but there is not yet search, export, or spaced repetition.
- The options page does not yet include a test-connection button.
- Custom base URLs may require additional host permissions beyond the default DeepSeek host permission.
