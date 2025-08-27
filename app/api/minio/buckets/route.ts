import { type NextRequest, NextResponse } from "next/server"
import { listBuckets, createBucket, deleteBucket } from "@/lib/minio-server"

export async function GET() {
  try {
    const buckets = await listBuckets()
    return NextResponse.json(buckets)
  } catch (error) {
    console.error("List buckets error:", error)
    return NextResponse.json(
      { message: error instanceof Error ? error.message : "Failed to list buckets" },
      { status: 500 },
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const { name, region } = await request.json()
    await createBucket(name, region)
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Create bucket error:", error)
    return NextResponse.json(
      { message: error instanceof Error ? error.message : "Failed to create bucket" },
      { status: 500 },
    )
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { name } = await request.json()
    await deleteBucket(name)
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Delete bucket error:", error)
    return NextResponse.json(
      { message: error instanceof Error ? error.message : "Failed to delete bucket" },
      { status: 500 },
    )
  }
}
