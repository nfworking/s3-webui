import { Client } from "minio"
import { handleMinIOError, isRetryableError } from "./error-handler"
import type { MinIOObject, BucketInfo } from "@/types/minio"

let minioClient: Client | null = null

function initializeMinIOClient(): Client {
  console.log("[v0] Environment variables check:")
  console.log("[v0] MINIO_ENDPOINT:", process.env.MINIO_ENDPOINT ? "SET" : "NOT SET")
  console.log("[v0] MINIO_ACCESS_KEY:", process.env.MINIO_ACCESS_KEY ? "SET" : "NOT SET")
  console.log("[v0] MINIO_SECRET_KEY:", process.env.MINIO_SECRET_KEY ? "SET" : "NOT SET")
  console.log("[v0] MINIO_PORT:", process.env.MINIO_PORT || "NOT SET (using default 9000)")
  console.log("[v0] MINIO_USE_SSL:", process.env.MINIO_USE_SSL || "NOT SET (using default false)")
  console.log("[v0] MINIO_REGION:", process.env.MINIO_REGION || "NOT SET (using default us-east-1)")

  const endPoint = process.env.MINIO_ENDPOINT
  const port = process.env.MINIO_PORT ? Number.parseInt(process.env.MINIO_PORT) : 9000
  const useSSL = process.env.MINIO_USE_SSL === "true"
  const accessKey = process.env.MINIO_ACCESS_KEY
  const secretKey = process.env.MINIO_SECRET_KEY
  const region = process.env.MINIO_REGION || "us-east-1"

  if (!endPoint || !accessKey || !secretKey) {
    throw new Error(
      "MinIO configuration missing. Please set MINIO_ENDPOINT, MINIO_ACCESS_KEY, and MINIO_SECRET_KEY environment variables.",
    )
  }

  if (!minioClient) {
    minioClient = new Client({
      endPoint,
      port,
      useSSL,
      accessKey,
      secretKey,
      region,
    })
  }

  return minioClient
}

export function getMinIOClient(): Client {
  if (!minioClient) {
    return initializeMinIOClient()
  }
  return minioClient
}

async function withRetry<T>(operation: () => Promise<T>, maxRetries = 3, delay = 1000): Promise<T> {
  let lastError: unknown

  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      return await operation()
    } catch (error) {
      lastError = error

      if (attempt === maxRetries || !isRetryableError(error)) {
        throw handleMinIOError(error)
      }

      await new Promise((resolve) => setTimeout(resolve, delay * attempt))
    }
  }

  throw handleMinIOError(lastError)
}

export async function testConnection(): Promise<boolean> {
  try {
    const client = getMinIOClient()
    await client.listBuckets()
    return true
  } catch (error) {
    console.error("MinIO connection test failed:", error)
    throw handleMinIOError(error)
  }
}

export async function listBuckets(): Promise<BucketInfo[]> {
  const client = getMinIOClient()

  return withRetry(async () => {
    const buckets = await client.listBuckets()
    return buckets.map((bucket) => ({
      name: bucket.name,
      creationDate: bucket.creationDate,
    }))
  })
}

export async function listObjects(bucketName: string, prefix?: string): Promise<MinIOObject[]> {
  const client = getMinIOClient()

  return withRetry(async () => {
    return new Promise<MinIOObject[]>((resolve, reject) => {
      const objects: MinIOObject[] = []
      const stream = client.listObjects(bucketName, prefix, true)

      stream.on("data", (obj) => {
        objects.push({
          name: obj.name,
          lastModified: obj.lastModified,
          etag: obj.etag,
          size: obj.size,
          prefix: obj.prefix,
        })
      })

      stream.on("error", reject)
      stream.on("end", () => resolve(objects))
    })
  })
}

export async function uploadFile(bucketName: string, objectName: string, buffer: Buffer): Promise<void> {
  const client = getMinIOClient()

  return withRetry(async () => {
    await client.putObject(bucketName, objectName, buffer)
  })
}

export async function downloadFile(bucketName: string, objectName: string): Promise<Buffer> {
  const client = getMinIOClient()

  return withRetry(async () => {
    return new Promise<Buffer>((resolve, reject) => {
      const chunks: Buffer[] = []

      client.getObject(bucketName, objectName, (error, stream) => {
        if (error) {
          reject(error)
          return
        }

        if (!stream) {
          reject(new Error("No stream received"))
          return
        }

        stream.on("data", (chunk) => {
          chunks.push(chunk)
        })

        stream.on("end", () => {
          const buffer = Buffer.concat(chunks)
          resolve(buffer)
        })

        stream.on("error", (error) => {
          reject(error)
        })
      })
    })
  })
}

export async function deleteObject(bucketName: string, objectName: string): Promise<void> {
  const client = getMinIOClient()

  return withRetry(async () => {
    await client.removeObject(bucketName, objectName)
  })
}

export async function createBucket(bucketName: string, region?: string): Promise<void> {
  const client = getMinIOClient()

  return withRetry(async () => {
    await client.makeBucket(bucketName, region || "us-east-1")
  })
}

export async function deleteBucket(bucketName: string): Promise<void> {
  const client = getMinIOClient()

  return withRetry(async () => {
    await client.removeBucket(bucketName)
  })
}

export async function bucketExists(bucketName: string): Promise<boolean> {
  const client = getMinIOClient()

  return withRetry(async () => {
    return await client.bucketExists(bucketName)
  })
}

export async function getBucketLocation(bucketName: string): Promise<string> {
  const client = getMinIOClient()

  return withRetry(async () => {
    return await client.getBucketLocation(bucketName)
  })
}
