
# Ollama Web UI (Go + HTML/JS)

A lightweight, clean, and fast local web interface for **Ollama**, built from scratch using **pure Go** and **vanilla HTML/CSS/JS** — no frameworks, no bloat, no magic.
Just a simple UI that talks directly to your local Ollama server.

This project exists for one purpose:

> Give you a small, hackable UI that you control completely.

If you want something minimal, tweakable, and easy to extend, this is it.

---

 Features

* **Local-only chat UI** (no external services, fully offline)
* **Model selector** (switch between installed Ollama models instantly)
* **Syntax-highlighted code blocks** using `highlight.js`
* **Dark/Light theme toggle** with smooth switching
* **Zero dependencies** on big frontend libraries
* **Simple Go backend** that proxies requests to Ollama (so no CORS headaches)
* Organized project structure that's easy to fork, extend, and customize

---

##  How It Works

* Browser → sends your prompt to the Go backend
* Go backend → forwards it to `http://localhost:11434/api/chat`
* Ollama → returns the response
* UI → displays it nicely, highlights any code blocks, and remembers your theme preference

Everything stays on your machine.


---

 Running the Project

Make sure Ollama is already running:

```bash
curl http://localhost:11434/api/tags
```

Then start the UI server:

```bash
go run main.go
```

Now open the interface:

```
http://localhost:8080
```
---

Simple. Clean. You can understand it in one glance.

---

 Customization

This project is intentionally easy to modify:

 Want more models? → Add `<option>` tags in `index.html`
 Want a sidebar or chat history? → Extend `script.js`
 Want to add system prompts? → Add a textbox and send it with the payload
 Want to make it look like ChatGPT? → Tweak the CSS

