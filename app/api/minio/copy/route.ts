import { type NextRequest, NextResponse } from "next/server"
import { getMinIOClient } from "@/lib/minio-server"

export async function POST(request: NextRequest) {
  try {
    const client = getMinIOClient()
    const { sourceBucket, sourceObject, destBucket, destObject } = await request.json()

    await client.copyObject(destBucket, destObject, `/${sourceBucket}/${sourceObject}`)

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Copy object error:", error)
    return NextResponse.json({ message: error instanceof Error ? error.message : "Copy failed" }, { status: 500 })
  }
}
