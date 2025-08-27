import type { MinIOConfig } from "@/types/minio"

// In a real application, you would store this in a database or secure storage
// For demo purposes, we'll use a simple in-memory store
let storedConfig: MinIOConfig | null = null

export function setStoredConfig(config: MinIOConfig): void {
  storedConfig = config
}

export function getStoredConfig(): MinIOConfig | null {
  return storedConfig
}

export function clearStoredConfig(): void {
  storedConfig = null
}
