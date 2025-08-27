import { type NextRequest, NextResponse } from "next/server"
import { listObjects, deleteObject } from "@/lib/minio-server"

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const bucket = searchParams.get("bucket")
    const prefix = searchParams.get("prefix")

    if (!bucket) {
      return NextResponse.json({ message: "Bucket name is required" }, { status: 400 })
    }

    const objects = await listObjects(bucket, prefix || undefined)
    return NextResponse.json(objects)
  } catch (error) {
    console.error("List objects error:", error)
    return NextResponse.json(
      { message: error instanceof Error ? error.message : "Failed to list objects" },
      { status: 500 },
    )
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { bucket, object } = await request.json()
    await deleteObject(bucket, object)
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Delete object error:", error)
    return NextResponse.json(
      { message: error instanceof Error ? error.message : "Failed to delete object" },
      { status: 500 },
    )
  }
}
