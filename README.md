<div align="center">

<img src="src/shared/assets/Multimate.png" alt="MultimateAi Logo" width="120" />

# MultimateAi

**Your Agentic Software Application**

AI-powered multi-agent platform that sends messages, automates workflows, and manages services — all without human intervention.

[![License](https://img.shields.io/badge/license-MIT-blue.svg)](LICENSE)
[![Electron](https://img.shields.io/badge/Electron-30-47848F?logo=electron)](https://www.electronjs.org/)
[![React](https://img.shields.io/badge/React-18-61DAFB?logo=react)](https://react.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5-3178C6?logo=typescript)](https://www.typescriptlang.org/)

</div>

---

## What It Does

MultimateAi is a desktop application that orchestrates AI agents across multiple platforms. It connects to your existing services and automates complex tasks using multi-agent workflows.

### Core Features

- **Multi-Agent Workflow** — Chain multiple AI models to solve complex tasks in sequence, range, or simultaneously
- **Service Integrations** — Slack, Telegram, Discord, GitHub, Notion, N8n, Google Sheets, Google Docs, Google Calendar
- **AI Chat** — Chat with any supported AI model (OpenAI, Anthropic, Gemini, Groq, DeepSeek, Mistral, Ollama, OpenRouter, Z.AI)
- **Discord** — Connect a bot, list guild channels, read history, send messages, and schedule cron messages
- **GitHub** — Manage repos, issues, pull requests, notifications, and commit files directly via the agent
- **Video Analysis** — Upload videos, transcribe, and generate AI-powered summaries
- **Email Automation** — Send emails via SMTP with AI-generated content
- **Usage Analytics** — Track token usage, costs, and activity across providers
- **Scheduling** — Cron-based message scheduling for Telegram, Slack, and Discord
- **Voice Input** — Record and transcribe voice messages

### Supported AI Providers

| Provider           | Models                                                                      |
| ------------------ | --------------------------------------------------------------------------- |
| OpenAI             | GPT-5.5, GPT-5.4, GPT-5.4-mini, o3, o3-pro, o4-mini, GPT-4o                 |
| Anthropic          | Claude Opus 4.7, Claude Sonnet 4.6, Claude Opus 4.5, Claude 3.5 Sonnet      |
| Google Gemini      | Gemini 3.5 Flash, Gemini 3.1 Pro, Gemini 3 Flash, Gemini 2.5 Pro/Flash      |
| Groq               | GPT-OSS-120B, Llama 3.3 70B, Llama 4 Scout, Qwen 3 32B                      |
| DeepSeek           | DeepSeek V4 Flash, DeepSeek V4 Pro                                          |
| Mistral            | Mistral Large, Mistral Medium, Mistral Small, Devstral                      |
| Ollama             | Any local model (Llama, Qwen, DeepSeek, Gemma, Phi and more)                |
| OpenRouter         | All supported models (Nemotron 3, GPT-OSS, Gemma 4, Qwen 3 and more)        |
| Z.AI               | GLM-5.2, GLM-5.1, GLM-5, GLM-4.7, GLM-4.6, GLM-4.5 (Zhipu AI)               |
| MultimateAi (Free) | DeepSeek V4 Flash, Mimo v2.5, Nemotron 3 Ultra, North Mini Code, Big Pickle |

---

## Tech Stack

| Layer             | Technology                                      |
| ----------------- | ----------------------------------------------- |
| **Frontend**      | React 18, TypeScript, Tailwind CSS 4            |
| **Desktop**       | Electron 30                                     |
| **State**         | Zustand (client), TanStack Query (server)       |
| **UI Components** | Radix UI, Lucide Icons, Framer Motion, Recharts |
| **AI Framework**  | LangChain.js, LangGraph                         |
| **Build**         | Vite 5, electron-builder                        |
| **Routing**       | React Router DOM 7                              |
| **Styling**       | Tailwind CSS 4, tw-animate-css                  |

---

## Installation

### Download

**[Download from GitHub Releases](https://github.com/NarihitoM/MultimateAi/releases)**

### From Source

- [Node.js](https://nodejs.org/) >= 18
- [Git](https://git-scm.com/)

```bash
git clone --branch v1.0.0 https://github.com/NarihitoM/MultimateAi.git
cd MultimateAi
npm install
npm run dev
```

### Available Scripts

| Command           | Description                                          |
| ----------------- | ---------------------------------------------------- |
| `npm run dev`     | Start Vite dev server + Electron                     |
| `npm run build`   | Build for production (TSC + Vite + Electron Builder) |
| `npm run deploy`  | Build and publish release                            |
| `npm run lint`    | Run ESLint                                           |
| `npm run preview` | Preview production build                             |

---

## License

[MIT LICENSE](LICENSE)
