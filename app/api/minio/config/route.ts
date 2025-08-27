import { type NextRequest, NextResponse } from "next/server"
import { setStoredConfig, clearStoredConfig, getStoredConfig } from "@/lib/config-storage"
import type { MinIOConfig } from "@/types/minio"

function getEnvConfig(): MinIOConfig | null {
  const endPoint = process.env.MINIO_ENDPOINT
  const port = process.env.MINIO_PORT ? Number(process.env.MINIO_PORT) : 9001
  const useSSL = process.env.MINIO_USE_SSL === "true"
  const accessKey = process.env.MINIO_ACCESS_KEY
  const secretKey = process.env.MINIO_SECRET_KEY
  const region = process.env.MINIO_REGION || "us-east-1"

  if (!endPoint || !accessKey || !secretKey) return null

  return { endPoint, port, useSSL, accessKey, secretKey, region }
}

export async function GET() {
  try {
    let config = getStoredConfig()
    if (!config) {
      config = getEnvConfig()
    }
    return NextResponse.json(config || {})
  } catch (error) {
    console.error("Get config error:", error)
    return NextResponse.json({ message: "Failed to get configuration" }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const config: MinIOConfig = await request.json()
    setStoredConfig(config)
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Save config error:", error)
    return NextResponse.json({ message: "Failed to save configuration" }, { status: 500 })
  }
}

export async function DELETE() {
  try {
    clearStoredConfig()
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Clear config error:", error)
    return NextResponse.json({ message: "Failed to clear configuration" }, { status: 500 })
  }
}
