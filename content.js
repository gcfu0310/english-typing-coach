(function () {
  const PANEL_ID = "english-typing-coach-panel";
  const NOTES_STORAGE_KEY = "englishTypingCoachNotes";

  function getTextFromElement(element) {
    if (!element) {
      return "";
    }

    if (element.tagName === "TEXTAREA" || element.tagName === "INPUT") {
      return element.value.trim();
    }

    if (element.isContentEditable) {
      return element.innerText.trim();
    }

    return "";
  }

  function findChatInputElement() {
    const activeElementText = getTextFromElement(document.activeElement);
    if (activeElementText) {
      return document.activeElement;
    }

    const selectors = [
      "#prompt-textarea",
      "textarea",
      "[contenteditable='true']"
    ];

    for (const selector of selectors) {
      const elements = document.querySelectorAll(selector);
      for (const element of elements) {
        if (getTextFromElement(element)) {
          return element;
        }
      }
    }

    return null;
  }

  function findChatDraftText() {
    return getTextFromElement(findChatInputElement());
  }

  function setTextToElement(element, text) {
    if (!element) {
      return false;
    }

    element.focus();

    if (element.tagName === "TEXTAREA" || element.tagName === "INPUT") {
      element.value = text;
    } else if (element.isContentEditable) {
      element.textContent = text;
    } else {
      return false;
    }

    element.dispatchEvent(new InputEvent("input", {
      bubbles: true,
      inputType: "insertText",
      data: text
    }));

    return true;
  }

  async function copyText(text) {
    if (navigator.clipboard && window.isSecureContext) {
      await navigator.clipboard.writeText(text);
      return;
    }

    const textArea = document.createElement("textarea");
    textArea.value = text;
    textArea.style.position = "fixed";
    textArea.style.left = "-9999px";
    document.body.appendChild(textArea);
    textArea.focus();
    textArea.select();
    document.execCommand("copy");
    textArea.remove();
  }

  function getSelectedText() {
    const selectedText = window.getSelection().toString().trim();
    return selectedText || "";
  }

  function getStorageArea() {
    if (typeof chrome !== "undefined" && chrome.storage && chrome.storage.local) {
      return "chrome";
    }

    return "localStorage";
  }

  function getNotes() {
    if (getStorageArea() === "chrome") {
      return new Promise(function (resolve) {
        chrome.storage.local.get([NOTES_STORAGE_KEY], function (result) {
          resolve(result[NOTES_STORAGE_KEY] || []);
        });
      });
    }

    const rawNotes = window.localStorage.getItem(NOTES_STORAGE_KEY);
    return Promise.resolve(rawNotes ? JSON.parse(rawNotes) : []);
  }

  function saveNotes(notes) {
    if (getStorageArea() === "chrome") {
      return new Promise(function (resolve) {
        chrome.storage.local.set({ [NOTES_STORAGE_KEY]: notes }, resolve);
      });
    }

    window.localStorage.setItem(NOTES_STORAGE_KEY, JSON.stringify(notes));
    return Promise.resolve();
  }

  async function addNote(noteInput) {
    const notes = await getNotes();
    const note = {
      id: "note_" + Date.now(),
      text: noteInput.text,
      meaning: noteInput.meaning,
      sourceChinese: noteInput.sourceChinese,
      sourceEnglish: noteInput.sourceEnglish,
      type: noteInput.text.includes(" ") ? "phrase" : "word",
      familiarity: "new",
      createdAt: new Date().toISOString()
    };

    notes.unshift(note);
    await saveNotes(notes);
    return note;
  }

  function buildMockTranslationResult(chineseText) {
    const normalizedText = chineseText.replace(/\s+/g, "");

    const examples = [
      {
        keywords: ["\u8bbe\u8ba1", "\u5408\u7406"],
        translation: "I want to check whether this design makes sense.",
        phrases: [
          {
            text: "make sense",
            meaning: "\u5408\u7406\uff1b\u8bf4\u5f97\u901a"
          }
        ]
      },
      {
        keywords: ["\u63d2\u4ef6", "\u5f00\u53d1"],
        translation: "I want to develop a plugin for learning English while chatting with ChatGPT.",
        phrases: [
          {
            text: "develop a plugin",
            meaning: "\u5f00\u53d1\u4e00\u4e2a\u63d2\u4ef6"
          }
        ]
      },
      {
        keywords: ["\u529f\u80fd", "\u6e05\u5355"],
        translation: "Let's start by writing the feature list and technical plan.",
        phrases: [
          {
            text: "feature list",
            meaning: "\u529f\u80fd\u6e05\u5355"
          }
        ]
      },
      {
        keywords: ["\u4e0b\u4e00\u6b65"],
        translation: "Let's move on to the next step.",
        phrases: [
          {
            text: "move on to",
            meaning: "\u8fdb\u5165\uff1b\u5f00\u59cb\u5904\u7406"
          }
        ]
      }
    ];

    const matchedExample = examples.find(function (example) {
      return example.keywords.every(function (keyword) {
        return normalizedText.includes(keyword);
      });
    });

    if (matchedExample) {
      return {
        translation: matchedExample.translation,
        phrases: matchedExample.phrases
      };
    }

    return {
      translation: "This is a mock English translation. We will replace it with DeepSeek later.",
      phrases: []
    };
  }

  function requestTranslation(sourceText) {
    if (typeof chrome === "undefined" || !chrome.runtime || !chrome.runtime.sendMessage) {
      return Promise.resolve({
        ok: false,
        error: "Extension runtime is not available on this test page."
      });
    }

    return new Promise(function (resolve) {
      chrome.runtime.sendMessage({
        type: "translate",
        sourceText: sourceText
      }, function (response) {
        if (chrome.runtime.lastError) {
          resolve({
            ok: false,
            error: chrome.runtime.lastError.message
          });
          return;
        }

        resolve(response || {
          ok: false,
          error: "No response from background script."
        });
      });
    });
  }

  function createPanel() {
    if (document.getElementById(PANEL_ID)) {
      return;
    }

    const panel = document.createElement("section");
    panel.id = PANEL_ID;
    panel.innerHTML = `
      <div class="etc-header">
        <strong>English Coach</strong>
        <span>MVP</span>
      </div>
      <p class="etc-help">Type Chinese in ChatGPT, then translate it for typing practice.</p>
      <div class="etc-actions">
        <button id="etc-read-draft-button" type="button">Read Draft</button>
        <button id="etc-translate-button" type="button">Translate</button>
      </div>
      <label class="etc-label" for="etc-draft-output">Chinese Draft</label>
      <pre id="etc-draft-output">No draft loaded yet.</pre>
      <label class="etc-label" for="etc-translation-output">Suggested English</label>
      <pre id="etc-translation-output">No translation yet.</pre>
      <div id="etc-phrase-suggestions" class="etc-phrase-suggestions"></div>
      <div class="etc-secondary-actions">
        <button id="etc-copy-button" type="button">Copy English</button>
        <button id="etc-insert-button" type="button">Insert English</button>
      </div>
      <div class="etc-note-form">
        <label class="etc-label" for="etc-note-text">Word / Phrase</label>
        <input id="etc-note-text" type="text" placeholder="make sense">
        <label class="etc-label" for="etc-note-meaning">Meaning</label>
        <input id="etc-note-meaning" type="text" placeholder="reasonable; logical">
        <button id="etc-add-note-button" type="button">Add Note</button>
      </div>
      <p id="etc-status" class="etc-status" aria-live="polite"></p>
    `;

    document.body.appendChild(panel);

    const readButton = panel.querySelector("#etc-read-draft-button");
    const translateButton = panel.querySelector("#etc-translate-button");
    const copyButton = panel.querySelector("#etc-copy-button");
    const insertButton = panel.querySelector("#etc-insert-button");
    const addNoteButton = panel.querySelector("#etc-add-note-button");
    const draftOutput = panel.querySelector("#etc-draft-output");
    const translationOutput = panel.querySelector("#etc-translation-output");
    const phraseSuggestions = panel.querySelector("#etc-phrase-suggestions");
    const noteTextInput = panel.querySelector("#etc-note-text");
    const noteMeaningInput = panel.querySelector("#etc-note-meaning");
    const status = panel.querySelector("#etc-status");
    let latestDraft = "";
    let latestTranslation = "";
    let latestPhrases = [];

    function setStatus(message) {
      status.textContent = message;
    }

    function renderPhraseSuggestions(phrases) {
      phraseSuggestions.replaceChildren();

      if (!phrases.length) {
        return;
      }

      const label = document.createElement("div");
      label.className = "etc-phrase-title";
      label.textContent = "Suggested phrases";
      phraseSuggestions.appendChild(label);

      phrases.forEach(function (phrase) {
        const button = document.createElement("button");
        button.type = "button";
        button.className = "etc-phrase-button";
        button.textContent = phrase.text + " = " + phrase.meaning;
        button.addEventListener("click", function () {
          noteTextInput.value = phrase.text;
          noteMeaningInput.value = phrase.meaning;
          setStatus("Phrase filled into the note form.");
        });
        phraseSuggestions.appendChild(button);
      });
    }

    readButton.addEventListener("click", function () {
      const draftText = findChatDraftText();
      draftOutput.textContent = draftText || "No draft found. Click the ChatGPT input box and type Chinese first.";
      latestDraft = draftText;
      setStatus(draftText ? "Draft loaded." : "");
    });

    translateButton.addEventListener("click", function () {
      const draftText = findChatDraftText();

      if (!draftText) {
        draftOutput.textContent = "No draft found. Click the ChatGPT input box and type Chinese first.";
        translationOutput.textContent = "No translation yet.";
        latestDraft = "";
        latestTranslation = "";
        latestPhrases = [];
        renderPhraseSuggestions([]);
        setStatus("");
        return;
      }

      latestDraft = draftText;
      draftOutput.textContent = draftText;
      translationOutput.textContent = "Translating...";
      latestTranslation = "";
      latestPhrases = [];
      renderPhraseSuggestions([]);
      setStatus("Requesting DeepSeek translation...");

      requestTranslation(draftText).then(function (response) {
        let result = response && response.ok ? response.result : null;
        let statusMessage = "DeepSeek translation ready.";

        if (!result || !result.translation) {
          result = buildMockTranslationResult(draftText);
          statusMessage = response && response.error
            ? "Using mock translation: " + response.error
            : "Using mock translation.";
        }

        latestTranslation = result.translation;
        latestPhrases = Array.isArray(result.phrases) ? result.phrases : [];
        translationOutput.textContent = latestTranslation;
        renderPhraseSuggestions(latestPhrases);
        setStatus(statusMessage);
      });
    });

    copyButton.addEventListener("click", async function () {
      if (!latestTranslation) {
        setStatus("Translate a draft before copying.");
        return;
      }

      try {
        await copyText(latestTranslation);
        setStatus("English copied.");
      } catch (error) {
        setStatus("Copy failed. You can select the English text manually.");
      }
    });

    insertButton.addEventListener("click", function () {
      if (!latestTranslation) {
        setStatus("Translate a draft before inserting.");
        return;
      }

      const inputElement = findChatInputElement();
      const inserted = setTextToElement(inputElement, latestTranslation);
      setStatus(inserted ? "English inserted into the ChatGPT input box." : "Could not find the ChatGPT input box.");
    });

    translationOutput.addEventListener("mouseup", function () {
      const selectedText = getSelectedText();
      if (selectedText) {
        noteTextInput.value = selectedText;
      }
    });

    addNoteButton.addEventListener("click", async function () {
      const noteText = noteTextInput.value.trim();
      const meaning = noteMeaningInput.value.trim();

      if (!noteText) {
        setStatus("Enter a word or phrase before saving.");
        return;
      }

      if (!meaning) {
        setStatus("Enter a meaning before saving.");
        return;
      }

      try {
        await addNote({
          text: noteText,
          meaning: meaning,
          sourceChinese: latestDraft,
          sourceEnglish: latestTranslation
        });
        noteTextInput.value = "";
        noteMeaningInput.value = "";
        setStatus("Note saved.");
      } catch (error) {
        setStatus("Could not save the note.");
      }
    });
  }

  function init() {
    if (!document.body) {
      window.setTimeout(init, 200);
      return;
    }

    createPanel();
  }

  init();
})();
