"use client"

import { useState, useEffect, useCallback } from "react"
import { useMinIOConfig } from "./use-minio-config"
import { testConnection } from "@/lib/minio-client"

export type ConnectionStatus = "disconnected" | "connecting" | "connected" | "error"

export function useConnectionStatus() {
  const { config, hasConfig } = useMinIOConfig()
  const [status, setStatus] = useState<ConnectionStatus>("disconnected")
  const [lastChecked, setLastChecked] = useState<Date | null>(null)
  const [error, setError] = useState<string>("")
  const [isChecking, setIsChecking] = useState(false)

  const checkConnection = useCallback(async () => {
    if (!hasConfig || !config) {
      setStatus("disconnected")
      return false
    }

    setIsChecking(true)
    setStatus("connecting")
    setError("")

    try {
      const isConnected = await testConnection(config)
      if (isConnected) {
        setStatus("connected")
        setLastChecked(new Date())
        return true
      } else {
        setStatus("error")
        setError("Connection failed")
        return false
      }
    } catch (err) {
      setStatus("error")
      setError(err instanceof Error ? err.message : "Unknown connection error")
      return false
    } finally {
      setIsChecking(false)
    }
  }, [config, hasConfig])

  // Auto-check connection when config changes
  useEffect(() => {
    if (hasConfig && config) {
      checkConnection()
    } else {
      setStatus("disconnected")
    }
  }, [hasConfig, config, checkConnection])

  // Periodic health check every 30 seconds
  useEffect(() => {
    if (status === "connected") {
      const interval = setInterval(checkConnection, 30000)
      return () => clearInterval(interval)
    }
  }, [status, checkConnection])

  return {
    status,
    error,
    lastChecked,
    isChecking,
    checkConnection,
    isConnected: status === "connected",
  }
}
