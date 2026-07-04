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
- **Service Integrations** — Slack, Telegram, Notion, N8n, Google Sheets, Google Docs
- **AI Chat** — Chat with any supported AI model (OpenAI, Anthropic, Groq, DeepSeek, Mistral, Ollama, OpenRouter)
- **Video Analysis** — Upload videos, transcribe, and generate AI-powered summaries
- **Email Automation** — Send emails via SMTP with AI-generated content
- **Usage Analytics** — Track token usage, costs, and activity across providers
- **Scheduling** — Cron-based message scheduling for Telegram and Slack
- **Voice Input** — Record and transcribe voice messages

### Supported AI Providers

| Provider | Models |
|----------|--------|
| OpenAI | GPT-4o, GPT-4o-mini, GPT-4.1, o1, o3, o4-mini |
| Anthropic | Claude 3.5 Sonnet, Claude 3 Opus, Claude 3 Haiku |
| Groq | Llama 3.3 70B, Mixtral 8x7B, Gemma 2 9B |
| DeepSeek | DeepSeek Chat, DeepSeek Reasoner |
| Mistral | Mistral Large, Mistral Small, Codestral |
| Ollama | Any local model |
| OpenRouter | All supported models |

---

## Tech Stack

| Layer | Technology |
|-------|------------|
| **Frontend** | React 18, TypeScript, Tailwind CSS 4 |
| **Desktop** | Electron 30 |
| **State** | Zustand (client), TanStack Query (server) |
| **UI Components** | Radix UI, Lucide Icons, Framer Motion, Recharts |
| **AI Framework** | LangChain.js, LangGraph |
| **Build** | Vite 5, electron-builder |
| **Routing** | React Router DOM 7 |
| **Styling** | Tailwind CSS 4, tw-animate-css |

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

| Command | Description |
|---------|-------------|
| `npm run dev` | Start Vite dev server + Electron |
| `npm run build` | Build for production (TSC + Vite + Electron Builder) |
| `npm run deploy` | Build and publish release |
| `npm run lint` | Run ESLint |
| `npm run preview` | Preview production build |

---

## License

[MIT LICENSE](LICENSE)
