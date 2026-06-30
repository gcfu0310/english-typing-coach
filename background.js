(function () {
  const SETTINGS_STORAGE_KEY = "englishTypingCoachSettings";

  const DEFAULT_SETTINGS = {
    provider: "deepseek",
    baseUrl: "https://api.deepseek.com",
    model: "deepseek-v4-flash",
    style: "natural",
    apiKey: ""
  };

  function getSettings() {
    return new Promise(function (resolve) {
      chrome.storage.local.get([SETTINGS_STORAGE_KEY], function (result) {
        resolve(Object.assign({}, DEFAULT_SETTINGS, result[SETTINGS_STORAGE_KEY] || {}));
      });
    });
  }

  function stripTrailingSlash(value) {
    return value.replace(/\/+$/, "");
  }

  function buildPrompt(sourceText, style) {
    const styleInstruction = {
      natural: "Use natural, clear English suitable for a ChatGPT conversation.",
      casual: "Use casual spoken English while staying accurate.",
      formal: "Use polished and slightly formal English.",
      simple: "Use simple English with common words and short sentence patterns."
    }[style] || "Use natural, clear English suitable for a ChatGPT conversation.";

    return [
      "Translate this Chinese draft into English for typing practice.",
      styleInstruction,
      "Return only JSON with this shape:",
      "{\"translation\":\"...\",\"phrases\":[{\"text\":\"...\",\"meaning\":\"...\"}]}",
      "Rules:",
      "- translation must be one useful English version.",
      "- phrases must contain 0 to 5 useful words or phrases from the translation.",
      "- phrase meanings must be concise Chinese explanations.",
      "- do not include Markdown.",
      "",
      "Chinese draft:",
      sourceText
    ].join("\n");
  }

  function parseModelContent(content) {
    const parsed = JSON.parse(content);
    return {
      translation: String(parsed.translation || "").trim(),
      phrases: Array.isArray(parsed.phrases) ? parsed.phrases.slice(0, 5).map(function (phrase) {
        return {
          text: String(phrase.text || "").trim(),
          meaning: String(phrase.meaning || "").trim()
        };
      }).filter(function (phrase) {
        return phrase.text && phrase.meaning;
      }) : []
    };
  }

  async function translateWithDeepSeek(sourceText) {
    const settings = await getSettings();

    if (!settings.apiKey) {
      throw new Error("Missing DeepSeek API key. Open extension options and save your API key.");
    }

    const baseUrl = stripTrailingSlash(settings.baseUrl || DEFAULT_SETTINGS.baseUrl);
    const response = await fetch(baseUrl + "/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": "Bearer " + settings.apiKey,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        model: settings.model || DEFAULT_SETTINGS.model,
        messages: [
          {
            role: "system",
            content: "You are a concise English learning assistant. Always return valid JSON only."
          },
          {
            role: "user",
            content: buildPrompt(sourceText, settings.style)
          }
        ],
        temperature: 0.3,
        max_tokens: 700,
        response_format: {
          type: "json_object"
        }
      })
    });

    const payload = await response.json().catch(function () {
      return {};
    });

    if (!response.ok) {
      const message = payload.error && payload.error.message ? payload.error.message : "DeepSeek request failed.";
      throw new Error(message);
    }

    const content = payload.choices && payload.choices[0] && payload.choices[0].message
      ? payload.choices[0].message.content
      : "";

    const result = parseModelContent(content);
    if (!result.translation) {
      throw new Error("DeepSeek returned an empty translation.");
    }

    return result;
  }

  chrome.runtime.onMessage.addListener(function (message, sender, sendResponse) {
    if (!message || message.type !== "translate") {
      return false;
    }

    translateWithDeepSeek(message.sourceText || "")
      .then(function (result) {
        sendResponse({
          ok: true,
          result: result
        });
      })
      .catch(function (error) {
        sendResponse({
          ok: false,
          error: error.message || "Translation failed."
        });
      });

    return true;
  });
})();
