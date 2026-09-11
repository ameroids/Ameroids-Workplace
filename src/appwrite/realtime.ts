import { client, config, isAppwriteConfigured } from './config'

export const realtime = {
  subscribeToChanges(onChange: () => void): () => void {
    if (!isAppwriteConfigured) return () => {}

    // Appwrite realtime channels format: databases.[databaseId].collections.[collectionId].documents
    const channels = [
      `databases.${config.databaseId}.collections.${config.collections.projects}.documents`,
      `databases.${config.databaseId}.collections.${config.collections.transactions}.documents`,
      `databases.${config.databaseId}.collections.${config.collections.meetings}.documents`,
      `databases.${config.databaseId}.collections.${config.collections.activityLogs}.documents`
    ]

    const unsubscribe = client.subscribe(channels, (response) => {
      // Trigger onChange for any event (create, update, delete) in these collections
      onChange()
    })

    return unsubscribe
  }
}
