"use client"

import { useState, useEffect } from "react"
import type { MinIOConfig } from "@/types/minio"

const STORAGE_KEY = "minio-config"

export function useMinIOConfig() {
  const [config, setConfig] = useState<MinIOConfig | null>(null)
  const [isLoaded, setIsLoaded] = useState(false)

  useEffect(() => {
    const loadConfig = async () => {
      // First try localStorage for immediate UI update
      const savedConfig = localStorage.getItem(STORAGE_KEY)
      if (savedConfig) {
        try {
          setConfig(JSON.parse(savedConfig))
        } catch (error) {
          console.error("Failed to parse saved MinIO config:", error)
        }
      }

      // Then sync with server configuration
      try {
        const response = await fetch("/api/minio/config")
        if (response.ok) {
          const serverConfig = await response.json()
          if (serverConfig && serverConfig.endPoint) {
            setConfig(serverConfig)
            // Keep localStorage in sync
            localStorage.setItem(STORAGE_KEY, JSON.stringify(serverConfig))
          }
        }
      } catch (error) {
        console.error("Failed to load server config:", error)
      }

      setIsLoaded(true)
    }

    loadConfig()
  }, [])

  const saveConfig = async (newConfig: MinIOConfig) => {
    setConfig(newConfig)
    localStorage.setItem(STORAGE_KEY, JSON.stringify(newConfig))

    try {
      await fetch("/api/minio/config", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newConfig),
      })
    } catch (error) {
      console.error("Failed to save config to server:", error)
    }
  }

  const clearConfig = async () => {
    setConfig(null)
    localStorage.removeItem(STORAGE_KEY)

    try {
      await fetch("/api/minio/config", { method: "DELETE" })
    } catch (error) {
      console.error("Failed to clear config from server:", error)
    }
  }

  return {
    config,
    saveConfig,
    clearConfig,
    isLoaded,
    hasConfig: !!config,
  }
}
