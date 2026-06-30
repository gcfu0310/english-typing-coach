(function () {
  const NOTES_STORAGE_KEY = "englishTypingCoachNotes";

  const notesList = document.getElementById("notes-list");
  const noteCount = document.getElementById("note-count");
  const emptyState = document.getElementById("empty-state");
  const refreshButton = document.getElementById("refresh-button");
  const optionsButton = document.getElementById("options-button");

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

  function formatDate(isoString) {
    if (!isoString) {
      return "";
    }

    const date = new Date(isoString);
    if (Number.isNaN(date.getTime())) {
      return "";
    }

    return date.toLocaleDateString(undefined, {
      month: "short",
      day: "numeric"
    });
  }

  function appendText(parent, tagName, className, text) {
    const element = document.createElement(tagName);
    element.className = className;
    element.textContent = text;
    parent.appendChild(element);
    return element;
  }

  async function deleteNote(noteId) {
    const notes = await getNotes();
    const nextNotes = notes.filter(function (note) {
      return note.id !== noteId;
    });
    await saveNotes(nextNotes);
    renderNotes(nextNotes);
  }

  function renderNotes(notes) {
    notesList.replaceChildren();
    noteCount.textContent = notes.length === 1 ? "1 note" : notes.length + " notes";
    emptyState.hidden = notes.length > 0;

    notes.forEach(function (note) {
      const article = document.createElement("article");
      article.className = "note-card";

      const topRow = document.createElement("div");
      topRow.className = "note-top-row";

      appendText(topRow, "h2", "note-text", note.text || "Untitled");
      appendText(topRow, "span", "note-type", note.type || "word");
      article.appendChild(topRow);

      appendText(article, "p", "note-meaning", note.meaning || "No meaning saved.");

      if (note.sourceEnglish) {
        appendText(article, "p", "note-source", note.sourceEnglish);
      }

      const metaRow = document.createElement("div");
      metaRow.className = "note-meta-row";
      appendText(metaRow, "span", "note-date", formatDate(note.createdAt));

      const deleteButton = document.createElement("button");
      deleteButton.type = "button";
      deleteButton.className = "delete-button";
      deleteButton.textContent = "Delete";
      deleteButton.addEventListener("click", function () {
        deleteNote(note.id);
      });
      metaRow.appendChild(deleteButton);

      article.appendChild(metaRow);
      notesList.appendChild(article);
    });
  }

  async function loadNotes() {
    const notes = await getNotes();
    renderNotes(notes);
  }

  refreshButton.addEventListener("click", loadNotes);
  optionsButton.addEventListener("click", function () {
    if (typeof chrome !== "undefined" && chrome.runtime && chrome.runtime.openOptionsPage) {
      chrome.runtime.openOptionsPage();
    }
  });
  loadNotes();
})();
