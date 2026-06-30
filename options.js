(function () {
  const SETTINGS_STORAGE_KEY = "englishTypingCoachSettings";

  const DEFAULT_SETTINGS = {
    provider: "deepseek",
    baseUrl: "https://api.deepseek.com",
    model: "deepseek-v4-flash",
    style: "natural",
    apiKey: ""
  };

  const form = document.getElementById("settings-form");
  const apiKeyInput = document.getElementById("api-key");
  const baseUrlInput = document.getElementById("base-url");
  const modelSelect = document.getElementById("model");
  const styleSelect = document.getElementById("style");
  const status = document.getElementById("status");

  function getSettings() {
    return new Promise(function (resolve) {
      chrome.storage.local.get([SETTINGS_STORAGE_KEY], function (result) {
        resolve(Object.assign({}, DEFAULT_SETTINGS, result[SETTINGS_STORAGE_KEY] || {}));
      });
    });
  }

  function saveSettings(settings) {
    return new Promise(function (resolve) {
      chrome.storage.local.set({ [SETTINGS_STORAGE_KEY]: settings }, resolve);
    });
  }

  function setStatus(message) {
    status.textContent = message;
  }

  async function loadSettings() {
    const settings = await getSettings();
    apiKeyInput.value = settings.apiKey || "";
    baseUrlInput.value = settings.baseUrl || DEFAULT_SETTINGS.baseUrl;
    modelSelect.value = settings.model || DEFAULT_SETTINGS.model;
    styleSelect.value = settings.style || DEFAULT_SETTINGS.style;
  }

  form.addEventListener("submit", async function (event) {
    event.preventDefault();

    const settings = {
      provider: "deepseek",
      apiKey: apiKeyInput.value.trim(),
      baseUrl: baseUrlInput.value.trim() || DEFAULT_SETTINGS.baseUrl,
      model: modelSelect.value,
      style: styleSelect.value
    };

    await saveSettings(settings);
    setStatus("Settings saved.");
  });

  loadSettings();
})();
