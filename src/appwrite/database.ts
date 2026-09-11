import { ID, Query } from 'appwrite'
import { databases, config, isAppwriteConfigured } from './config'

export const dbService = {
  // Add abstraction for mapping Appwrite Document fields to our Types
  mapDoc<T>(doc: any): T {
    // We map $id to id, and remove Appwrite specific fields if needed
    // However, Appwrite SDK doesn't strictly need stripping, but mapping $id to id is crucial
    const { $id, $createdAt, $updatedAt, $permissions, $databaseId, $collectionId, ...rest } = doc
    return {
      id: $id,
      created_at: $createdAt,
      updated_at: $updatedAt,
      ...rest
    } as T
  }
}
