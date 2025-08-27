import { type NextRequest, NextResponse } from "next/server"
import { uploadFile } from "@/lib/minio-server"

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData()
    const file = formData.get("file") as File
    const bucket = formData.get("bucket") as string
    const objectName = formData.get("objectName") as string

    if (!file || !bucket || !objectName) {
      return NextResponse.json({ message: "Missing required fields" }, { status: 400 })
    }

    const buffer = Buffer.from(await file.arrayBuffer())
    await uploadFile(bucket, objectName, buffer)

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Upload error:", error)
    return NextResponse.json({ message: error instanceof Error ? error.message : "Upload failed" }, { status: 500 })
  }
}
