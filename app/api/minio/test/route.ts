import { NextResponse } from "next/server"
import { testConnection } from "@/lib/minio-server"

export async function GET() {
  try {
    const result = await testConnection()
    return NextResponse.json({ connected: result })
  } catch (error) {
    console.error("MinIO test connection error:", error)
    return NextResponse.json(
      { message: error instanceof Error ? error.message : "Connection test failed" },
      { status: 500 },
    )
  }
}
