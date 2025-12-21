/// <reference types="vite/client" />

declare interface ImportMetaEnv {
  readonly VITE_SUPABASE_URL: string;
  readonly VITE_SUPABASE_KEY: string;
  // Add other environment variables here if needed
}

declare interface ImportMeta {
  readonly env: ImportMetaEnv;
}