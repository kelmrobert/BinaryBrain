/// &lt;reference types="vite/client" /&gt;

interface ImportMetaEnv {
  readonly VITE_OPENAI_API_KEY: string
  readonly VITE_OPENAI_MODEL: string
  readonly VITE_APP_NAME: string
  readonly VITE_MAX_FILE_SIZE: string
  readonly BASE_URL: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}