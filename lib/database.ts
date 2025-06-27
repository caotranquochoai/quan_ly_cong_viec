// Browser-compatible database interface
export interface DatabaseConfig {
  host: string
  user: string
  password: string
  database: string
}

const dbConfig: DatabaseConfig = {
  host: process.env.DB_HOST!,
  user: process.env.DB_USER!,
  password: process.env.DB_PASSWORD!,
  database: process.env.DB_DATABASE!,
}

// Mock database functions for client-side (will be replaced by API calls)
export async function executeQuery(query: string, params: any[] = []) {
  throw new Error("Database queries must be executed server-side")
}

export async function initializeDatabase() {
  // This will be handled by server-side API
  console.log("Database initialization handled by server")
}

export { dbConfig }
