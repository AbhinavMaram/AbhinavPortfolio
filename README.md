# Abhinav Reddy — Portfolio

Personal portfolio for **Abhinav Reddy, Full Stack .NET Developer** (.NET Core · Angular · React · Azure · AWS).

The site is designed as a **CI/CD pipeline run**: a vertical pipeline rail tracks your progress through the stages (`init → restore → build → test → deploy → release`), the hero streams a live deploy log, skills are a browsable "dependency graph", impact metrics are "passing tests", and work history is a "deployment history" with expandable changelogs.

## Features

- **AI agent (`ask.ai`)**: a résumé-grounded chatbot powered by an [Ollama](https://ollama.com) model through an Azure Function (`/api/chat`). If the API is unavailable it falls back to an offline résumé index in the browser, so the widget always answers.
- **Command palette**: `Ctrl/⌘ + K` or `/` to jump to sections, toggle the theme, copy the email, or send a question to the agent.
- **Skill grep**: search any technology to see where it shows up in the skill set and which employers used it in production.
- **Reactive microservice mesh** background (canvas), light/dark theme (follows the OS on first visit), and `prefers-reduced-motion` support.
- No build step: plain HTML, CSS and ES modules.

## Structure

```
frontend/
  index.html                 page shell
  css/main.css               design system + layout
  js/data.js                 all résumé content (single source of truth)
  js/main.js                 rendering, pipeline rail, palette, mesh
  js/chat.js                 AI agent UI + offline fallback
  staticwebapp.config.json   SWA routing, headers, API runtime
  assets/                    icons
backend/ContactFunction/     .NET 8 isolated Azure Functions
  ChatFunction.cs            POST /api/chat (Ollama)
  ResumeContext.cs           system prompt with the résumé
```

To update content, edit `frontend/js/data.js` **and** `backend/ContactFunction/ResumeContext.cs`, so the site and the agent stay in sync.

## Configuration (Azure Static Web App → Environment variables)

| Setting | Purpose |
|---|---|
| `OLLAMA_BASE_URL` | Where Ollama runs, e.g. `https://ollama.com` (Ollama Cloud) or your own server. Without it, `/api/chat` returns 503 and the widget uses its offline answers. |
| `OLLAMA_MODEL` | Model name, e.g. `gpt-oss:20b` (Cloud) or `llama3.2` (self-hosted). |
| `OLLAMA_API_KEY` | Optional bearer token: required for Ollama Cloud or a secured server. |

The chat sends the last 12 turns (1,000 characters each at most) to Ollama's `/api/chat` with temperature 0.3, a 600-token answer cap and an 8K context, and strips any `<think>` reasoning before replying. Requests time out after 40 s (Static Web Apps allows ~45 s).

## Run locally

```bash
# Model (https://ollama.com/download)
ollama pull llama3.2

# API (needs Azure Functions Core Tools v4 + .NET 8 SDK)
# set OLLAMA_BASE_URL=http://localhost:11434 and OLLAMA_MODEL=llama3.2 in local.settings.json
cd backend/ContactFunction
func start            # http://localhost:7071/api/chat

# Frontend: any static server; proxy /api to :7071, or use the SWA CLI:
npx @azure/static-web-apps-cli start frontend --api-devserver-url http://localhost:7071
```

## Deployment

Azure Static Web Apps through GitHub Actions (`.github/workflows/`). A push to `main` deploys `frontend/` as-is (no build) together with the Functions API.
