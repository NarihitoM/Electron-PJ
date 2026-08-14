/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_BACKEND_URL: string;
  readonly VITE_SUPABASE: string;
  readonly VITE_CLIENTID: string;
  readonly VITE_GOOGLE_CLIENT_ID: string;
  readonly VITE_SLACK_CLIENT_ID: string;
  readonly VITE_NOTION_CLIENT_ID: string;
  readonly VITE_GITHUB_CLIENT_ID: string;
  readonly VITE_DISCORD_CLIENT_ID: string;
  readonly VITE_VERCEL_INTEGRATION_SLUG: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
