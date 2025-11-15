const form = document.getElementById("chat-form");
const promptInput = document.getElementById("prompt");
const messagesEl = document.getElementById("messages");
const modelSelect = document.getElementById("model-select");
const themeToggle = document.getElementById("theme-toggle");

let currentTheme = "light";

function escapeHtml(str) {
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

// Take assistant text, find ```code``` blocks, wrap them with <pre><code>
function formatAssistantMessage(text) {
  const codeBlockRegex = /```(\w+)?\n([\s\S]*?)```/g;

  let html = "";
  let lastIndex = 0;
  let match;

  while ((match = codeBlockRegex.exec(text)) !== null) {
    const before = text.slice(lastIndex, match.index);
    if (before.trim()) {
      html += `<p>${escapeHtml(before).replace(/\n/g, "<br>")}</p>`;
    }

    const lang = match[1] ? match[1].toLowerCase() : "";
    const code = match[2];

    html += `<pre><code class="${lang ? "language-" + lang : ""}">${escapeHtml(
      code
    )}</code></pre>`;

    lastIndex = codeBlockRegex.lastIndex;
  }

  const after = text.slice(lastIndex);
  if (after.trim()) {
    html += `<p>${escapeHtml(after).replace(/\n/g, "<br>")}</p>`;
  }

  if (!html) {
    html = escapeHtml(text).replace(/\n/g, "<br>");
  }

  return html;
}

function addMessage(text, role) {
  const div = document.createElement("div");
  div.classList.add("message", role);

  if (role === "assistant") {
    div.innerHTML = formatAssistantMessage(text);
  } else {
    // user: plain text
    div.textContent = text;
  }

  messagesEl.appendChild(div);
  messagesEl.scrollTop = messagesEl.scrollHeight;

  // Highlight any <code> blocks in this message
  if (role === "assistant" && window.hljs) {
    div.querySelectorAll("pre code").forEach((block) => {
      hljs.highlightElement(block);
    });
  }
}

form.addEventListener("submit", async (e) => {
  e.preventDefault();
  const prompt = promptInput.value.trim();
  if (!prompt) return;

  const model = modelSelect.value;

  // show user message
  addMessage(prompt, "user");
  promptInput.value = "";
  promptInput.focus();

  // placeholder for assistant typing
  const thinkingEl = document.createElement("div");
  thinkingEl.classList.add("message", "assistant");
  thinkingEl.textContent = "Thinking...";
  messagesEl.appendChild(thinkingEl);
  messagesEl.scrollTop = messagesEl.scrollHeight;

  try {
    const res = await fetch("/api/chat", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ prompt, model }),
    });

    if (!res.ok) {
      thinkingEl.textContent = "Error from server.";
      return;
    }

    const data = await res.json();
    const reply = data.reply || "(empty response)";

    // replace "Thinking..." box with formatted message
    thinkingEl.remove();
    addMessage(reply, "assistant");
  } catch (err) {
    console.error(err);
    thinkingEl.textContent = "Failed to reach backend.";
  }
});

themeToggle.addEventListener("click", () => {
  currentTheme = currentTheme === "light" ? "dark" : "light";
  document.documentElement.setAttribute("data-theme", currentTheme);
  themeToggle.textContent =
    currentTheme === "light" ? "Dark mode" : "Light mode";

  localStorage.setItem("theme", currentTheme);
});

window.addEventListener("load", () => {
  const stored = localStorage.getItem("theme");
  if (stored === "dark") {
    currentTheme = "dark";
    document.documentElement.setAttribute("data-theme", "dark");
    themeToggle.textContent = "Light mode";
  }
});

