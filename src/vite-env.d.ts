/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_BACKEND_URL: string;
  readonly VITE_SUPABASE: string;
  readonly VITE_CLIENTID: string;
  readonly VITE_SLACK_CLIENT_ID: string;
  readonly VITE_NOTION_CLIENT_ID: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
