import { type NextRequest, NextResponse } from "next/server"
import { downloadFile } from "@/lib/minio-server"

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const bucket = searchParams.get("bucket")
    const object = searchParams.get("object")

    if (!bucket || !object) {
      return NextResponse.json({ message: "Bucket and object names are required" }, { status: 400 })
    }

    const buffer = await downloadFile(bucket, object)

    return new NextResponse(buffer, {
      headers: {
        "Content-Type": "application/octet-stream",
        "Content-Disposition": `attachment; filename="${object}"`,
      },
    })
  } catch (error) {
    console.error("Download error:", error)
    return NextResponse.json({ message: error instanceof Error ? error.message : "Download failed" }, { status: 500 })
  }
}
