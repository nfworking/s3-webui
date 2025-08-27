"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { CheckCircleIcon, XCircleIcon, Cog6ToothIcon, InformationCircleIcon } from "@heroicons/react/24/outline"

export default function SettingsPage() {
  const [connectionStatus, setConnectionStatus] = useState<"idle" | "success" | "error">("idle")
  const [connectionError, setConnectionError] = useState<string>("")
  const [isTestingConnection, setIsTestingConnection] = useState(false)

  useEffect(() => {
    testConnectionFromEnv()
  }, [])

  const testConnectionFromEnv = async () => {
    setIsTestingConnection(true)
    setConnectionStatus("idle")
    setConnectionError("")

    try {
      const response = await fetch("/api/minio/test")
      const data = await response.json()

      if (response.ok && data.connected) {
        setConnectionStatus("success")
      } else {
        setConnectionStatus("error")
        setConnectionError(data.message || "Failed to connect to MinIO server")
      }
    } catch (error) {
      setConnectionStatus("error")
      setConnectionError(error instanceof Error ? error.message : "Unknown connection error")
    } finally {
      setIsTestingConnection(false)
    }
  }

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-foreground flex items-center">
          <Cog6ToothIcon className="h-8 w-8 mr-3 text-primary" />
          Settings
        </h1>
        <p className="text-muted-foreground mt-2">MinIO S3 storage configuration via environment variables</p>
      </div>

      <div className="space-y-6">
        {/* Connection Status */}
        <Alert
          className={
            connectionStatus === "success"
              ? "border-green-200 bg-green-50"
              : connectionStatus === "error"
                ? "border-red-200 bg-red-50"
                : "border-blue-200 bg-blue-50"
          }
        >
          <div className="flex items-center">
            {connectionStatus === "success" ? (
              <CheckCircleIcon className="h-4 w-4 text-green-600" />
            ) : connectionStatus === "error" ? (
              <XCircleIcon className="h-4 w-4 text-red-600" />
            ) : (
              <InformationCircleIcon className="h-4 w-4 text-blue-600" />
            )}
            <AlertDescription className="ml-2">
              {connectionStatus === "success"
                ? "✅ MinIO connection successful! All environment variables are properly configured."
                : connectionStatus === "error"
                  ? `❌ ${connectionError || "Connection failed"}`
                  : isTestingConnection
                    ? "🔄 Testing MinIO connection..."
                    : "ℹ️ MinIO configuration is managed via environment variables"}
            </AlertDescription>
          </div>
        </Alert>

        {/* Environment Variables Configuration */}
        <Card>
          <CardHeader>
            <CardTitle>Environment Variables</CardTitle>
            <CardDescription>
              MinIO configuration is now managed through environment variables for better security
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="bg-muted/50 p-4 rounded-lg">
              <h4 className="font-medium mb-3">Required Environment Variables:</h4>
              <div className="space-y-2 font-mono text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">MINIO_ENDPOINT</span>
                  <span>Your MinIO server endpoint</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">MINIO_ACCESS_KEY</span>
                  <span>Your MinIO access key</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">MINIO_SECRET_KEY</span>
                  <span>Your MinIO secret key</span>
                </div>
              </div>
            </div>

            <div className="bg-muted/50 p-4 rounded-lg">
              <h4 className="font-medium mb-3">Optional Environment Variables:</h4>
              <div className="space-y-2 font-mono text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">MINIO_PORT</span>
                  <span>Port (default: 9000)</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">MINIO_USE_SSL</span>
                  <span>Use SSL (default: false)</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">MINIO_REGION</span>
                  <span>Region (default: us-east-1)</span>
                </div>
              </div>
            </div>

            <Button onClick={testConnectionFromEnv} disabled={isTestingConnection} className="w-full">
              {isTestingConnection ? "Testing Connection..." : "Test Connection"}
            </Button>
          </CardContent>
        </Card>

        {/* Setup Instructions */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <InformationCircleIcon className="h-5 w-5 mr-2 text-primary" />
              Setup Instructions
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-4">
              <div>
                <h4 className="font-medium mb-2">For Local Development:</h4>
                <div className="bg-muted p-3 rounded font-mono text-sm">
                  <div>MINIO_ENDPOINT=localhost</div>
                  <div>MINIO_PORT=9000</div>
                  <div>MINIO_USE_SSL=false</div>
                  <div>MINIO_ACCESS_KEY=minioadmin</div>
                  <div>MINIO_SECRET_KEY=minioadmin</div>
                  <div>MINIO_REGION=us-east-1</div>
                </div>
              </div>

              <div>
                <h4 className="font-medium mb-2">For Production:</h4>
                <ul className="text-sm text-muted-foreground space-y-1">
                  <li>• Set environment variables in your deployment platform</li>
                  <li>• Use strong, unique access and secret keys</li>
                  <li>• Enable SSL for production environments</li>
                  <li>• Ensure your MinIO server is accessible from your application</li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
