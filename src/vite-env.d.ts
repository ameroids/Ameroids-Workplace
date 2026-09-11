/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_APPWRITE_ENDPOINT?: string
  readonly VITE_APPWRITE_PROJECT_ID?: string
  readonly VITE_APPWRITE_DATABASE_ID?: string
  readonly VITE_APPWRITE_PROJECTS_COLLECTION_ID?: string
  readonly VITE_APPWRITE_PROJECT_UPDATES_COLLECTION_ID?: string
  readonly VITE_APPWRITE_PROJECT_NOTES_COLLECTION_ID?: string
  readonly VITE_APPWRITE_TRANSACTIONS_COLLECTION_ID?: string
  readonly VITE_APPWRITE_MEETINGS_COLLECTION_ID?: string
  readonly VITE_APPWRITE_ACTIVITY_LOGS_COLLECTION_ID?: string
  readonly VITE_APPWRITE_PROFILES_COLLECTION_ID?: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}
